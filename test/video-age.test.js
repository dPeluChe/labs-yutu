import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAgeInMonths } from '../content/video-age.js';

test('parses English relative dates into months', () => {
  assert.equal(parseAgeInMonths('16 hours ago'), 0);
  assert.equal(parseAgeInMonths('3 days ago'), 0);
  assert.equal(parseAgeInMonths('1 month ago'), 1);
  assert.equal(parseAgeInMonths('6 months ago'), 6);
  assert.equal(parseAgeInMonths('2 years ago'), 24);
  assert.equal(parseAgeInMonths('Streamed 1 year ago'), 12);
  assert.ok(Math.abs(parseAgeInMonths('2 weeks ago') - 0.46) < 0.01);
});

test('parses Spanish relative dates', () => {
  assert.equal(parseAgeInMonths('hace 6 meses'), 6);
  assert.equal(parseAgeInMonths('hace 1 mes'), 1);
  assert.equal(parseAgeInMonths('hace 2 años'), 24);
  assert.equal(parseAgeInMonths('hace 1 año'), 12);
  assert.equal(parseAgeInMonths('hace 3 días'), 0);
});

test('returns null for text that is not a relative date', () => {
  assert.equal(parseAgeInMonths('147K'), null);
  assert.equal(parseAgeInMonths('1:06:36'), null);
  assert.equal(parseAgeInMonths('1,234 watching'), null);
  assert.equal(parseAgeInMonths(''), null);
  assert.equal(parseAgeInMonths(null), null);
});
