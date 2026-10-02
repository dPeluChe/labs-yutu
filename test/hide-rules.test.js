import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHideCss, HIDE_OPTIONS } from '../content/hide-rules.js';
import { DEFAULT_SETTINGS } from '../content/config.js';

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

test('watch page hiding is off by default', () => {
  assert.ok(Object.values(DEFAULT_SETTINGS.watchPage).every((v) => v === false));
  assert.equal(DEFAULT_SETTINGS.oldVideoFilter.enabled, false);
});
