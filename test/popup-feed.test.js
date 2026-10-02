import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../popup/popup.html', import.meta.url), 'utf8')
  .replace(/<script[^>]*src[^>]*><\/script>/g, '');
const dom = new JSDOM(html);
const store = {};
const reloaded = [];
let activeTab = { id: 7, url: 'https://www.youtube.com/' };

Object.assign(globalThis, {
  document: dom.window.document,
  chrome: {
    storage: { local: { get: async (key) => ({ [key]: store[key] }), set: async (obj) => Object.assign(store, obj) } },
    tabs: { query: async () => [activeTab], reload: async (id) => { reloaded.push(id); } }
  }
});

const { setupFeed } = await import('../popup/feed.js');
await setupFeed();

const $ = (id) => document.getElementById(id);
const change = (el) => el.dispatchEvent(new dom.window.Event('change'));
const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

test('reload button is hidden until a feed option is saved', async () => {
  assert.ok($('feed-reload-btn').classList.contains('is-hidden'));
  $('old-enabled').checked = true;
  change($('old-enabled'));
  await tick();
  assert.equal(store.yutuSettings.oldVideoFilter.enabled, true);
  assert.equal($('feed-reload-btn').classList.contains('is-hidden'), false);
});

test('any other option also reveals the reload button', async () => {
  $('feed-reload-btn').classList.add('is-hidden');
  $('old-months').value = '12';
  change($('old-months'));
  await tick();
  assert.equal(store.yutuSettings.oldVideoFilter.months, 12);
  assert.equal($('feed-reload-btn').classList.contains('is-hidden'), false);
});

test('clicking reload refreshes the active YouTube tab and hides the button', async () => {
  $('feed-reload-btn').click();
  await tick();
  assert.deepEqual(reloaded, [7]);
  assert.ok($('feed-reload-btn').classList.contains('is-hidden'));
});

test('reload refuses non-YouTube tabs', async () => {
  activeTab = { id: 9, url: 'https://example.com/' };
  $('feed-reload-btn').classList.remove('is-hidden');
  $('feed-reload-btn').click();
  await tick();
  assert.deepEqual(reloaded, [7]);
  assert.match($('feed-status').textContent, /Open YouTube first/);
});
