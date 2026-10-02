import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://www.youtube.com/' });
let onChanged = null;
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  chrome: {
    storage: {
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

const page = (...ages) => `<ytd-browse>${ages.map(card).join('')}</ytd-browse>`;

const oldCards = () => [...document.querySelectorAll('[data-yutu-old]')];

function start(config) {
  let mutate = () => {};
  const filter = new OldVideoFilter({ manager: { onMutation: (cb) => { mutate = cb; } }, config });
  filter.init();
  return { filter, mutate };
}

const change = (oldVideoFilter) =>
  onChanged({ yutuSettings: { newValue: { oldVideoFilter } } }, 'local');

beforeEach(() => {
  dom.reconfigure({ url: 'https://www.youtube.com/' });
  document.body.innerHTML = '';
});

test('marks only cards older than the threshold', async () => {
  document.body.innerHTML = page('16 hours ago', '5 months ago', '6 months ago', '2 years ago');
  start({ enabled: true, months: 6, mode: 'blur' });
  const ages = oldCards().map((c) => c.getAttribute('data-yutu-old'));
  assert.deepEqual(ages, ['blur', 'blur']);
});

test('does nothing while disabled', async () => {
  document.body.innerHTML = page('2 years ago');
  start({ enabled: false, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 0);
});

test('ignores cards outside the Home feed', async () => {
  dom.reconfigure({ url: 'https://www.youtube.com/@channel/videos' });
  document.body.innerHTML = page('2 years ago');
  start({ enabled: true, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 0);
});

test('cards that render later are picked up on mutation', async () => {
  document.body.innerHTML = page();
  const { mutate } = start({ enabled: true, months: 6, mode: 'hide' });
  document.querySelector('ytd-browse').insertAdjacentHTML('beforeend', card('1 year ago'));
  mutate();
  assert.equal(oldCards()[0].getAttribute('data-yutu-old'), 'hide');
});

test('settings changes re-evaluate measured cards without rescanning dates', async () => {
  document.body.innerHTML = page('3 months ago', '1 year ago');
  start({ enabled: true, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 1);

  change({ enabled: true, months: 1, mode: 'blur' });
  assert.equal(oldCards().length, 2);

  change({ enabled: true, months: 1, mode: 'hide' });
  assert.deepEqual(oldCards().map((c) => c.getAttribute('data-yutu-old')), ['hide', 'hide']);

  change({ enabled: false });
  assert.equal(oldCards().length, 0);
});

test('leaving Home clears the effect and coming back restores it', async () => {
  document.body.innerHTML = page('2 years ago');
  const { filter } = start({ enabled: true, months: 6, mode: 'blur' });
  assert.equal(oldCards().length, 1);

  dom.reconfigure({ url: 'https://www.youtube.com/@channel/videos' });
  filter.refresh();
  assert.equal(oldCards().length, 0);

  dom.reconfigure({ url: 'https://www.youtube.com/' });
  filter.refresh();
  assert.equal(oldCards().length, 1);
});

test('works on the real lockup markup (aria-label on the last metadata part)', async () => {
  document.body.innerHTML = `<ytd-browse><ytd-rich-item-renderer><yt-lockup-view-model>
    <span class="ytAttributedStringHost ytContentMetadataViewModelMetadataText" aria-label="131 thousand views" role="text">131K</span>
    <span class="ytAttributedStringHost ytContentMetadataViewModelMetadataText ytContentMetadataViewModelMetadataTextLastPart" aria-label="2 months ago" role="text">2mo ago</span>
  </yt-lockup-view-model></ytd-rich-item-renderer></ytd-browse>`;
  start({ enabled: true, months: 1, mode: 'blur' });
  assert.equal(oldCards().length, 1);
});

test('cards without a parsable date are skipped and eventually given up on', async () => {
  document.body.innerHTML = '<ytd-browse page-subtype="home"><ytd-rich-item-renderer><span class="ytContentMetadataViewModelMetadataText">LIVE</span></ytd-rich-item-renderer></ytd-browse>';
  const { filter } = start({ enabled: true, months: 6, mode: 'blur' });
  for (let i = 0; i < 5; i++) filter.scan();
  const el = document.querySelector('ytd-rich-item-renderer');
  assert.equal(el.hasAttribute('data-yutu-old'), false);
  assert.equal(el.getAttribute('data-yutu-age'), '');
});
