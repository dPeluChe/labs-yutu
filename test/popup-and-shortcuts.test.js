import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain } from '../popup/domain.js';
import {
  getShortcutHintText,
  getShortcutLabel,
  isTypingContext,
  SHORTCUTS_BY_CODE,
  PRESET_SPEEDS
} from '../content/speed-shortcuts.js';

test('normalizeDomain strips protocol, path and www', () => {
  assert.equal(normalizeDomain('  HTTPS://www.Example.com/path?q=1 '), 'example.com');
  assert.equal(normalizeDomain('sub.example.com'), 'sub.example.com');
  assert.equal(normalizeDomain(''), '');
  assert.equal(normalizeDomain(undefined), '');
});

test('every shortcut maps to a preset speed', () => {
  for (const speed of Object.values(SHORTCUTS_BY_CODE)) assert.ok(PRESET_SPEEDS.includes(speed));
});

test('shortcut labels follow the platform modifier', () => {
  assert.equal(getShortcutHintText(true), '⌥+1..4');
  assert.equal(getShortcutHintText(false), 'Alt+1..4');
  assert.equal(getShortcutLabel(1.5, false), '1.5x (Alt+3)');
  assert.equal(getShortcutLabel(3, true), '3x');
});

test('isTypingContext detects form fields and contenteditable', () => {
  assert.equal(isTypingContext({ tagName: 'INPUT' }), true);
  assert.equal(isTypingContext({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isTypingContext({ tagName: 'DIV' }), false);
  assert.equal(isTypingContext(null), false);
});
