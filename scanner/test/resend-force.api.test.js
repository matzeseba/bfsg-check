import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-force-manual-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
const TOKEN = '0123456789abcdef0123456789abcdef01';
process.env.ADMIN_TOKEN = TOKEN;
process.env.RESEND_RATE_MAX = '1000';
delete process.env.STRIPE_SECRET_KEY;

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');
const orders = await import('../lib/orders.js');

const REAL = { ...services };
let seq = 0;
const sid = () => `cs_force_${Date.now()}_${seq++}`;
const authPost = (id, body) => request(app).post(`/api/resend/${id}`).set('Authorization', `Bearer ${TOKEN}`).send(body);

async function seedOrder({ sessionId, status, extra = {} }) {
  await orders.recordPaid({ eventId: `evt_${sessionId}`, sessionId, email: 'k@example.com', url: 'https://example.com', pkg: 'basis', amount: 12900 });
  await orders.markStatus(sessionId, status, extra);
  return sessionId;
}

test('force: MAILED + pdfPath -> mail-only, reuses invoice, no rescan', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'MAILED', extra: { pdfPath: '/tmp/r.pdf', invoiceNumber: 'RE-9001' } });
  let invoiceCalls = 0, fulfillCalls = 0, sentInvoiceNumber;
  services.generateInvoicePdf = async () => { invoiceCalls++; return { invoiceNumber: 'SHOULD-NOT-HAPPEN', pdfPath: '/x', date: '2026' }; };
  services.fulfillOrder = async () => { fulfillCalls++; throw new Error('should not rescan'); };
  services.sendReportFor = async ({ invoiceNumber }) => { sentInvoiceNumber = invoiceNumber; return { dryRun: true }; };

  const res = await authPost(id, { force: true });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.mode, 'mail-only');
  assert.equal(invoiceCalls, 0, 'no new invoice generated');
  assert.equal(fulfillCalls, 0, 'no rescan');
  assert.equal(sentInvoiceNumber, 'RE-9001', 'reused existing invoice number');
  Object.assign(services, REAL);
});

test('force: without pdfPath -> 409, no rescan possible', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'MAILED', extra: {} });
  let fulfillCalls = 0;
  services.fulfillOrder = async () => { fulfillCalls++; throw new Error('should not run'); };
  const res = await authPost(id, { force: true });
  assert.equal(res.status, 409);
  assert.equal(fulfillCalls, 0);
  Object.assign(services, REAL);
});

test('force + url together -> 400 (mutually exclusive)', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'MAILED', extra: { pdfPath: '/tmp/r.pdf', invoiceNumber: 'RE-1' } });
  const res = await authPost(id, { force: true, url: 'https://example.com/new' });
  assert.equal(res.status, 400);
  Object.assign(services, REAL);
});

test('non-force on MAILED -> still 409 (unchanged)', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'MAILED', extra: { pdfPath: '/tmp/r.pdf', invoiceNumber: 'RE-1' } });
  const res = await authPost(id, {});
  assert.equal(res.status, 409);
  Object.assign(services, REAL);
});
