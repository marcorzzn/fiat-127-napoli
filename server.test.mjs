import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

async function withServer(fn) {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('serves root launcher page and health endpoint', async () => {
  await withServer(async (baseUrl) => {
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    assert.deepEqual(await healthRes.json(), { ok: true });

    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const html = await rootRes.text();
    assert.match(html, /Uno com escada/);
    assert.match(html, /Fable 5\.2/);
    assert.match(html, /Opus 5\.5/);
    assert.match(html, /GPT-6\.2 Astra/);
  });
});

test('serves all three standalone WebGPU game builds intact', async () => {
  await withServer(async (baseUrl) => {
    const expected = [
      ['/fable/', 'Uno com escada — circuito'],
      ['/opus/', 'Mille EP — Circuito da Serra'],
      ['/astra/', 'Serra do Lume'],
    ];
    for (const [route, titleSnippet] of expected) {
      const res = await fetch(`${baseUrl}${route}`);
      assert.equal(res.status, 200, `${route} should return 200`);
      const text = await res.text();
      assert.ok(text.includes(titleSnippet), `${route} should contain "${titleSnippet}"`);
    }
  });
});

test('serves screenshots from .github/screenshots and returns 404 for unknown routes', async () => {
  await withServer(async (baseUrl) => {
    for (const img of ['fable-tv.jpg', 'fable-largada.jpg', 'opus-largada.jpg', 'astra-largada.jpg']) {
      const res = await fetch(`${baseUrl}/screenshots/${img}`);
      assert.equal(res.status, 200, `${img} should load`);
      assert.match(res.headers.get('content-type') || '', /image\/jpeg/);
    }

    const missing = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(missing.status, 404);
  });
});
