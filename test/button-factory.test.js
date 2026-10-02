import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://www.youtube.com/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node });

const { injectYouTubeCardButtons, injectExternalVideoLinkButtons, resetInjectedButtons } =
  await import('../content/button-factory.js');

const CARD = `
  <ytd-rich-item-renderer>
    <a id="thumbnail" href="/watch?v=abc123"><img src="x.jpg"></a>
    <div id="details"></div>
  </ytd-rich-item-renderer>`;

const count = (sel) => document.querySelectorAll(sel).length;

beforeEach(() => {
  document.body.innerHTML = '';
});

test('injects a thumbnail button and a metadata button once per card', () => {
  document.body.innerHTML = CARD;
  injectYouTubeCardButtons(() => {});
  assert.equal(count('.yutu-pip-btn'), 2);
  assert.equal(count('.yutu-pip-btn--meta'), 1);
});

test('is idempotent across repeated scans', () => {
  document.body.innerHTML = CARD;
  injectYouTubeCardButtons(() => {});
  injectYouTubeCardButtons(() => {});
  assert.equal(count('.yutu-pip-btn'), 2);
});

test('nested cards only get buttons on the outermost one', () => {
  document.body.innerHTML = `
    <ytd-rich-item-renderer>
      <yt-lockup-view-model>
        <a id="thumbnail" href="/watch?v=abc123"><img src="x.jpg"></a>
        <div id="details"></div>
      </yt-lockup-view-model>
    </ytd-rich-item-renderer>`;
  injectYouTubeCardButtons(() => {});
  assert.equal(count('.yutu-pip-btn'), 2);
  assert.equal(count('ytd-rich-item-renderer[data-yutu-injected]'), 1);
  assert.equal(count('yt-lockup-view-model[data-yutu-injected]'), 0);
});

test('resetInjectedButtons clears buttons and markers so cards are re-processed', () => {
  document.body.innerHTML = CARD;
  injectYouTubeCardButtons(() => {});
  resetInjectedButtons();
  assert.equal(count('.yutu-pip-btn'), 0);
  assert.equal(count('[data-yutu-injected]'), 0);
  injectYouTubeCardButtons(() => {});
  assert.equal(count('.yutu-pip-btn'), 2);
});

test('cards without a video link are ignored', () => {
  document.body.innerHTML = '<ytd-rich-item-renderer><a href="/channel/x">c</a></ytd-rich-item-renderer>';
  injectYouTubeCardButtons(() => {});
  assert.equal(count('.yutu-pip-btn'), 0);
});

test('custom selector decides where the thumbnail button goes', () => {
  document.body.innerHTML = `
    <ytd-rich-item-renderer>
      <a id="thumbnail" href="/watch?v=abc123"><img src="x.jpg"></a>
      <div class="custom-slot"></div>
    </ytd-rich-item-renderer>`;
  injectYouTubeCardButtons(() => {}, { customSelector: '.custom-slot' });
  assert.equal(count('.custom-slot > .yutu-pip-btn'), 1);
});

test('an invalid custom selector falls back to the defaults', () => {
  document.body.innerHTML = CARD;
  injectYouTubeCardButtons(() => {}, { customSelector: '[[bad' });
  assert.equal(count('#thumbnail > .yutu-pip-btn'), 1);
});

test('clicking a button opens the normalized video URL', () => {
  document.body.innerHTML = CARD;
  const opened = [];
  injectYouTubeCardButtons((url) => opened.push(url));
  document.querySelector('.yutu-pip-btn--meta').click();
  assert.deepEqual(opened, ['https://www.youtube.com/watch?v=abc123']);
});

test('external links get one inline button, and google scope skips other contexts', () => {
  document.body.innerHTML = '<p><a id="a" href="https://youtu.be/xyz">v</a></p>';
  injectExternalVideoLinkButtons(() => {}, { scope: 'google' });
  assert.equal(count('.yutu-inline-open-btn'), 0);
  injectExternalVideoLinkButtons(() => {}, { scope: 'all' });
  injectExternalVideoLinkButtons(() => {}, { scope: 'all' });
  assert.equal(count('.yutu-inline-open-btn'), 1);
});
