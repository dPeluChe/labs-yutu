import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = { location: { origin: 'https://www.youtube.com' } };
const { extractVideoTarget, getYouTubeVideoId, getVimeoVideoId } = await import('../content/url-utils.js');

test('extracts id from /watch, shorts, embed and youtu.be', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=abc123&t=5',
    'https://www.youtube.com/shorts/abc123',
    'https://www.youtube.com/embed/abc123',
    'https://youtu.be/abc123'
  ]) {
    assert.deepEqual(extractVideoTarget(url), {
      provider: 'youtube',
      videoId: 'abc123',
      url: 'https://www.youtube.com/watch?v=abc123'
    });
  }
});

test('resolves relative hrefs against the page origin', () => {
  assert.equal(extractVideoTarget('/watch?v=xyz').videoId, 'xyz');
});

test('vimeo ids use the first numeric segment', () => {
  assert.equal(getVimeoVideoId(new URL('https://vimeo.com/channels/staff/12345')), '12345');
  assert.deepEqual(extractVideoTarget('https://vimeo.com/12345'), {
    provider: 'vimeo',
    videoId: '12345',
    url: 'https://vimeo.com/12345'
  });
});

test('returns null for unsupported or id-less URLs', () => {
  assert.equal(extractVideoTarget('https://example.com/watch?v=1'), null);
  assert.equal(extractVideoTarget('https://www.youtube.com/'), null);
  assert.equal(getYouTubeVideoId(new URL('https://www.youtube.com/feed')), null);
});
