import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://www.youtube.com/' });
let stored = {};
let onChanged = null;
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  chrome: {
    storage: {
      local: { get: async (key) => ({ [key]: stored }) },
      onChanged: { addListener: (fn) => { onChanged = fn; } }
    }
  }
});

const { OldVideoFilter } = await import('../content/old-video-filter.js');

const card = (age) => `
  <ytd-rich-item-renderer>
    <span class="ytContentMetadataViewModelMetadataText" aria-label="147 thousand views">147K</span>
    <span class="ytContentMetadataViewModelMetadataText" aria-label="${age}">${age}</span>
  </ytd-rich-item-renderer>`;

const page = (subtype, ...ages) =>
  `<ytd-browse page-subtype="${subtype}">${ages.map(card).join('')}</ytd-browse>`;

const oldCards = () => [...document.querySelectorAll('[data-yutu-old]')];

async function start(oldVideoFilter) {
  stored = { oldVideoFilter };
  let mutate = () => {};
  const filter = new OldVideoFilter({ manager: { onMutation: (cb) => { mutate = cb; } } });
  await filter.init();
  return { filter, mutate };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

test('marks only cards older than the threshold', async () => {
  document.body.innerHTML = page('home', '16 hours ago', '5 months ago', '6 months ago', '2 years ago');
  await start({ enabled: true, months: 6, mode: 'blur' });
  const ages = oldCards().map((c) => c.getAttribute('data-yutu-old'));
  assert.deepEqual(ages, ['blur', 'blur']);
});

test('does nothing while disabled', async () => {
  document.body.innerHTML = page('home', '2 years ago');
  await start({ enabled: false, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 0);
});

test('ignores cards outside the Home feed', async () => {
  document.body.innerHTML = page('channels', '2 years ago');
  await start({ enabled: true, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 0);
});

test('cards that render later are picked up on mutation', async () => {
  document.body.innerHTML = page('home');
  const { mutate } = await start({ enabled: true, months: 6, mode: 'hide' });
  document.querySelector('ytd-browse').insertAdjacentHTML('beforeend', card('1 year ago'));
  mutate();
  assert.equal(oldCards()[0].getAttribute('data-yutu-old'), 'hide');
});

test('settings changes re-evaluate measured cards without rescanning dates', async () => {
  document.body.innerHTML = page('home', '3 months ago', '1 year ago');
  await start({ enabled: true, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 1);

  onChanged({ yutuSettings: { newValue: { oldVideoFilter: { enabled: true, months: 1, mode: 'blur' } } } }, 'local');
  assert.equal(oldCards().length, 2);

  onChanged({ yutuSettings: { newValue: { oldVideoFilter: { enabled: true, months: 1, mode: 'hide' } } } }, 'local');
  assert.deepEqual(oldCards().map((c) => c.getAttribute('data-yutu-old')), ['hide', 'hide']);

  onChanged({ yutuSettings: { newValue: { oldVideoFilter: { enabled: false } } } }, 'local');
  assert.equal(oldCards().length, 0);
});

test('cards without a parsable date are skipped and eventually given up on', async () => {
  document.body.innerHTML = '<ytd-browse page-subtype="home"><ytd-rich-item-renderer><span class="ytContentMetadataViewModelMetadataText">LIVE</span></ytd-rich-item-renderer></ytd-browse>';
  const { filter } = await start({ enabled: true, months: 6, mode: 'blur' });
  for (let i = 0; i < 5; i++) filter.scan();
  const el = document.querySelector('ytd-rich-item-renderer');
  assert.equal(el.hasAttribute('data-yutu-old'), false);
  assert.equal(el.getAttribute('data-yutu-age'), '');
});
