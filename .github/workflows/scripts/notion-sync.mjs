// Sync von /admin/orders + /admin/subscriptions nach Notion-DBs.
// Idempotent via Session-ID/Subscription-ID. Update wenn schon da, sonst create.

import { Client } from '@notionhq/client';

const {
  NOTION_TOKEN,
  NOTION_DB_ORDERS,
  NOTION_DB_SUBSCRIPTIONS,
  ADMIN_TOKEN,
  BFSG_URL = 'https://bfsg-fix.de'
} = process.env;

const notion = new Client({ auth: NOTION_TOKEN });

async function fetchAdminApi(path) {
  const res = await fetch(`${BFSG_URL}${path}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

async function findExisting(databaseId, titleProperty, titleValue) {
  const r = await notion.databases.query({
    database_id: databaseId,
    filter: { property: titleProperty, title: { equals: titleValue } },
    page_size: 1
  });
  return r.results[0];
}

function propsForOrder(o) {
  return {
    'Session-ID': { title: [{ text: { content: String(o.sessionId || '') } }] },
    'E-Mail': o.email ? { email: o.email } : undefined,
    'URL': o.url ? { url: o.url } : undefined,
    'Paket': o.pkg ? { select: { name: o.pkg } } : undefined,
    'Betrag (€)': typeof o.amount === 'number' ? { number: o.amount / 100 } : undefined,
    'Status': o.status ? { select: { name: o.status } } : undefined,
    'Erstellt': o.ts ? { date: { start: o.ts } } : undefined,
    'PDF-Pfad': o.pdfPath ? { rich_text: [{ text: { content: String(o.pdfPath).slice(0, 1900) } }] } : undefined,
    'Fehler': o.error ? { rich_text: [{ text: { content: String(o.error).slice(0, 1900) } }] } : undefined
  };
}

function propsForSub(s) {
  return {
    'Subscription-ID': { title: [{ text: { content: String(s.subscriptionId || '') } }] },
    'E-Mail': s.email ? { email: s.email } : undefined,
    'URL': s.url ? { url: s.url } : undefined,
    'Paket': s.pkg ? { select: { name: s.pkg } } : undefined,
    'Status': s.status ? { select: { name: s.status } } : undefined,
    'Created': s.createdAt ? { date: { start: s.createdAt } } : undefined,
    'Letzter Re-Check': s.lastScanAt ? { date: { start: s.lastScanAt } } : undefined,
    'Customer-ID Stripe': s.customerId ? { rich_text: [{ text: { content: String(s.customerId) } }] } : undefined
  };
}

function cleanProps(p) {
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined));
}

async function upsert(databaseId, titleProperty, titleValue, properties) {
  const existing = await findExisting(databaseId, titleProperty, titleValue);
  if (existing) {
    await notion.pages.update({ page_id: existing.id, properties: cleanProps(properties) });
    return { action: 'updated', id: existing.id };
  } else {
    const created = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: cleanProps(properties)
    });
    return { action: 'created', id: created.id };
  }
}

async function main() {
  console.log('[sync] Fetching /admin/orders ...');
  const ordersResp = await fetchAdminApi('/admin/orders?limit=200');
  console.log(`[sync] Got ${ordersResp.count} orders`);

  let created = 0, updated = 0;
  for (const o of ordersResp.orders || []) {
    if (!o.sessionId) continue;
    try {
      const r = await upsert(NOTION_DB_ORDERS, 'Session-ID', o.sessionId, propsForOrder(o));
      if (r.action === 'created') created++; else updated++;
    } catch (e) {
      console.error(`[sync] Order ${o.sessionId} failed: ${e.message}`);
    }
  }
  console.log(`[sync] Orders done: ${created} created, ${updated} updated`);

  console.log('[sync] Fetching /admin/subscriptions ...');
  const subsResp = await fetchAdminApi('/admin/subscriptions');
  console.log(`[sync] Got ${subsResp.count} subscriptions`);

  let sCreated = 0, sUpdated = 0;
  for (const s of subsResp.subscriptions || []) {
    if (!s.subscriptionId) continue;
    try {
      const r = await upsert(NOTION_DB_SUBSCRIPTIONS, 'Subscription-ID', s.subscriptionId, propsForSub(s));
      if (r.action === 'created') sCreated++; else sUpdated++;
    } catch (e) {
      console.error(`[sync] Sub ${s.subscriptionId} failed: ${e.message}`);
    }
  }
  console.log(`[sync] Subscriptions done: ${sCreated} created, ${sUpdated} updated`);
  console.log('[sync] DONE');
}

main().catch((e) => {
  console.error('[sync] FATAL:', e);
  process.exit(1);
});
