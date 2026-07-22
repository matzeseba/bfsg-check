// PR-P3a-Tests: Provider-Abstraktion des Report-QA-LLM-Clients.
// Prüft: Provider-Auswahl (Default anthropic), OpenAI-kompatibles Request-Shape
// (URL/Header/Tool-Call) via injiziertem fetch-Mock (KEIN Netzwerk) und dass
// fehlender Key die QA inert lässt (kein Call, kein Fehler, null).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  llmProvider, llmApiKey, reportQaModel, llmBaseUrl, anthropicQaEnabled, callReportQa
} from '../lib/anthropic-client.js';
import { qaReport } from '../lib/report-qa.js';

const TOOL = 'submit_report_qa';
const SCHEMA = { type: 'object', additionalProperties: false, properties: {}, required: [] };

test('Provider-Auswahl: Default anthropic, openai-compatible erkannt, unbekannt → anthropic', () => {
  assert.equal(llmProvider({}), 'anthropic');
  assert.equal(llmProvider({ LLM_PROVIDER: 'openai-compatible' }), 'openai-compatible');
  assert.equal(llmProvider({ LLM_PROVIDER: ' OpenAI-Compatible ' }), 'openai-compatible'); // tolerant
  assert.equal(llmProvider({ LLM_PROVIDER: 'gibts-nicht' }), 'anthropic');                // sicherer Fallback

  // Key-Fallback: LLM_API_KEY vor ANTHROPIC_API_KEY (Rückwärtskompatibilität).
  assert.equal(llmApiKey({}), '');
  assert.equal(llmApiKey({ ANTHROPIC_API_KEY: 'sk-old' }), 'sk-old');
  assert.equal(llmApiKey({ ANTHROPIC_API_KEY: 'sk-old', LLM_API_KEY: 'sk-new' }), 'sk-new');
  assert.equal(anthropicQaEnabled({ REPORT_QA_ENABLED: 'true', LLM_API_KEY: 'sk-new' }), true);

  // Modell: LLM_MODEL > REPORT_QA_MODEL (legacy) > Default claude-sonnet-4-6.
  assert.equal(reportQaModel({}), 'claude-sonnet-4-6');
  assert.equal(reportQaModel({ REPORT_QA_MODEL: 'claude-opus-4-8' }), 'claude-opus-4-8');
  assert.equal(reportQaModel({ REPORT_QA_MODEL: 'x', LLM_MODEL: 'gpt-4o-mini' }), 'gpt-4o-mini');

  // Base-URL: Default OpenAI, trailing slash normalisiert.
  assert.equal(llmBaseUrl({}), 'https://api.openai.com/v1');
  assert.equal(llmBaseUrl({ LLM_BASE_URL: 'http://localhost:11434/v1/' }), 'http://localhost:11434/v1');
});

test('openai-compatible: korrektes Request-Shape + Tool-Call-Parsing (fetch-Mock)', async () => {
  const calls = [];
  const fetchMock = async (url, opts) => {
    calls.push({ url, opts });
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            tool_calls: [{
              function: { name: TOOL, arguments: JSON.stringify({ verdict: 'ok', hits: [] }) }
            }]
          }
        }]
      })
    };
  };

  const res = await callReportQa(
    { system: 'SYS', user: 'USR', toolName: TOOL, toolSchema: SCHEMA },
    {
      provider: 'openai-compatible',
      fetch: fetchMock,
      apiKey: 'sk-test',
      baseUrl: 'https://llm.beispiel.de/v1',
      model: 'gpt-4o-mini'
    }
  );

  assert.equal(calls.length, 1);
  const { url, opts } = calls[0];
  assert.equal(url, 'https://llm.beispiel.de/v1/chat/completions');
  assert.equal(opts.method, 'POST');
  assert.equal(opts.headers.authorization, 'Bearer sk-test');
  assert.equal(opts.headers['content-type'], 'application/json');

  const body = JSON.parse(opts.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.deepEqual(body.messages, [
    { role: 'system', content: 'SYS' },
    { role: 'user', content: 'USR' }
  ]);
  assert.equal(body.tools[0].function.name, TOOL);
  assert.deepEqual(body.tool_choice, { type: 'function', function: { name: TOOL } });

  assert.deepEqual(res, { refused: false, data: { verdict: 'ok', hits: [] } });
});

test('fehlender Key → QA inert: kein Netzwerk-Call, qaReport gibt null zurück', async () => {
  // Gate: Flag ohne Key bleibt aus — für beide Provider.
  assert.equal(anthropicQaEnabled({ REPORT_QA_ENABLED: 'true', LLM_PROVIDER: 'openai-compatible' }), false);

  // fetch-Mock, der beim Aufruf explodiert: beweist, dass nichts aufgerufen wird.
  const explodingFetch = async () => { throw new Error('Netzwerk-Call hätte nicht passieren dürfen'); };
  const scan = {
    url: 'https://beispiel.de', scannedAt: '2026-07-01T00:00:00Z', meta: {},
    violations: [{ id: 'image-alt', impact: 'serious', help: 'image-alt', tags: ['wcag2aa'], nodes: [{ target: ['#a'] }] }],
    passes: 1, incomplete: 0
  };
  // Ohne forceEnabled ist das Gate aktiv: REPORT_QA_ENABLED/Key sind in der
  // Test-Umgebung nicht gesetzt → null, ohne den Provider zu berühren.
  const out = await qaReport({ scan, pkg: 'basis' }, { provider: 'openai-compatible', fetch: explodingFetch });
  assert.equal(out, null);

  // Direktaufruf ohne Key: klarer Fehler statt HTTP-Request (fail-open im Aufrufer).
  await assert.rejects(
    callReportQa(
      { system: 'S', user: 'U', toolName: TOOL, toolSchema: SCHEMA },
      { provider: 'openai-compatible', fetch: explodingFetch, apiKey: '', baseUrl: 'https://x.invalid/v1' }
    ),
    /API_KEY fehlt/
  );
});
