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
    assert.match(html, /Gran Premio di Napoli/);
    assert.match(html, /Fiat 127 Napoli 1926/);
    assert.match(html, /ViktorKav/);
  });
});

test('serves all four standalone WebGPU game builds intact', async () => {
  await withServer(async (baseUrl) => {
    const expected = [
      ['/napoli/', 'Gran Premio di Napoli · Fiat 127 Napoli 1926'],
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

test('serves Napoli reference assets, repository screenshots, and 404 on missing routes', async () => {
  await withServer(async (baseUrl) => {
    const refAssets = [
      'image_f3e260ec.png',
      'image_352b7143.png',
      'image_2f330de5.png',
      'image_89486885.png',
    ];
    for (const img of refAssets) {
      const res = await fetch(`${baseUrl}/assets/aistudio/${img}`);
      assert.equal(res.status, 200, `${img} should load`);
      assert.match(res.headers.get('content-type') || '', /image\/png/);
    }

    for (const img of ['fable-largada.jpg', 'opus-largada.jpg', 'astra-largada.jpg']) {
      const res = await fetch(`${baseUrl}/screenshots/${img}`);
      assert.equal(res.status, 200, `${img} should load`);
      assert.match(res.headers.get('content-type') || '', /image\/jpeg/);
    }

    const missing = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(missing.status, 404);
  });
});
