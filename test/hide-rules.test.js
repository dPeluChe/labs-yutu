import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHideCss, buildHomeShortsCss, HIDE_OPTIONS } from '../content/hide-rules.js';
import { JSDOM } from 'jsdom';
import { DEFAULT_SETTINGS } from '../content/config.js';
import { HOME_SHORTS_SELECTORS } from '../content/selectors.js';

test('only enabled flags produce rules', () => {
  const css = buildHideCss({ hideHeader: true });
  assert.match(css, /ytd-masthead \{ display: none !important; \}/);
  assert.doesNotMatch(css, /#secondary/);
});

test('empty or missing flags produce no css', () => {
  assert.equal(buildHideCss({}), '');
  assert.equal(buildHideCss(undefined), '');
});

test('scope prefixes every selector in a rule', () => {
  const css = buildHideCss({ hideSidebar: true }, 'html[data-yutu-watch]');
  const selectors = css.slice(0, css.indexOf('{')).split(',').map((s) => s.trim());
  assert.ok(selectors.length > 1);
  for (const selector of selectors) assert.ok(selector.startsWith('html[data-yutu-watch] '), selector);
});

test('every option maps to selectors and a default flag', () => {
  for (const option of HIDE_OPTIONS) {
    assert.ok(buildHideCss({ [option.key]: true }).length > 0, option.key);
    assert.ok(option.key in DEFAULT_SETTINGS.watchPage, option.key);
  }
});

test('watch page hiding, home shorts hiding and the old-video filter are off by default', () => {
  assert.ok(Object.values(DEFAULT_SETTINGS.watchPage).every((v) => v === false));
  assert.equal(DEFAULT_SETTINGS.hideHomeShorts, false);
  assert.equal(DEFAULT_SETTINGS.oldVideoFilter.enabled, false);
});

test('home shorts rule is empty when disabled and scoped to Home when enabled', () => {
  assert.equal(buildHomeShortsCss(false, 'html[data-yutu-home]'), '');
  const css = buildHomeShortsCss(true, 'html[data-yutu-home]');
  const scoped = css.match(/html\[data-yutu-home\] ytd-rich-(section|shelf|item)-renderer:has\(/g);
  assert.equal(scoped.length, 3);
  assert.match(css, /ytm-shorts-lockup-view-model/);
});

test('home shorts selectors match the Shorts block but not regular video cards', () => {
  const { document } = new JSDOM(`<ytd-rich-grid-renderer>
    <ytd-rich-item-renderer id="video"><yt-lockup-view-model></yt-lockup-view-model></ytd-rich-item-renderer>
    <ytd-rich-section-renderer id="section"><ytd-rich-shelf-renderer id="shelf">
      <ytd-rich-item-renderer id="short"><ytm-shorts-lockup-view-model-v2>
        <ytm-shorts-lockup-view-model></ytm-shorts-lockup-view-model>
      </ytm-shorts-lockup-view-model-v2></ytd-rich-item-renderer>
    </ytd-rich-shelf-renderer></ytd-rich-section-renderer>
  </ytd-rich-grid-renderer>`).window;
  const ids = [...document.querySelectorAll(HOME_SHORTS_SELECTORS.join(','))].map((el) => el.id);
  assert.deepEqual(ids, ['section', 'shelf', 'short']);
});
