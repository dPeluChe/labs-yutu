import { test } from 'node:test';
import assert from 'node:assert/strict';

let listener = null;
let registrations = 0;
globalThis.chrome = {
  storage: { onChanged: { addListener: (fn) => { listener = fn; registrations += 1; } } }
};

const { mergeSettings, subscribeSettings, DEFAULT_SETTINGS } = await import('../content/config.js');

test('mergeSettings overlays stored values and merges object settings one level deep', () => {
  const merged = mergeSettings({ hideHeader: false, watchPage: { hideSidebar: true }, oldVideoFilter: { months: 3 } });
  assert.equal(merged.hideHeader, false);
  assert.equal(merged.hideReels, DEFAULT_SETTINGS.hideReels);
  assert.deepEqual(merged.watchPage, { ...DEFAULT_SETTINGS.watchPage, hideSidebar: true });
  assert.deepEqual(merged.oldVideoFilter, { ...DEFAULT_SETTINGS.oldVideoFilter, months: 3 });
});

test('mergeSettings falls back to defaults for missing or empty storage', () => {
  assert.deepEqual(mergeSettings(undefined), DEFAULT_SETTINGS);
  assert.deepEqual(mergeSettings({}), DEFAULT_SETTINGS);
});

test('subscribeSettings shares one storage listener and delivers merged settings', () => {
  const seenA = [];
  const seenB = [];
  subscribeSettings((s) => seenA.push(s));
  subscribeSettings((s) => seenB.push(s));
  assert.equal(registrations, 1);

  listener({ other: { newValue: {} } }, 'local');
  listener({ yutuSettings: { newValue: { hideHomeShorts: true } } }, 'sync');
  assert.equal(seenA.length, 0);

  listener({ yutuSettings: { newValue: { hideHomeShorts: true } } }, 'local');
  assert.equal(seenA[0].hideHomeShorts, true);
  assert.deepEqual(seenA[0].watchPage, DEFAULT_SETTINGS.watchPage);
  assert.equal(seenB.length, 1);
});

test('clearing the stored settings notifies subscribers with the defaults', () => {
  const seen = [];
  subscribeSettings((s) => seen.push(s));
  listener({ yutuSettings: { oldValue: { hideHomeShorts: true } } }, 'local');
  assert.equal(seen.at(-1).hideHomeShorts, false);
});
