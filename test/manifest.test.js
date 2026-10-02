import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url)));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const root = new URL('../', import.meta.url);

test('manifest and package versions match', () => {
  assert.equal(manifest.version, pkg.version);
});

test('icons and static assets exist in the source tree', () => {
  for (const icon of Object.values(manifest.icons)) assert.ok(existsSync(new URL(icon, root)), icon);
  assert.ok(existsSync(new URL(manifest.action.default_popup, root)));
});

test('every content script entry has a source file', () => {
  for (const cs of manifest.content_scripts) {
    for (const file of [...cs.js, ...(cs.css ?? [])]) assert.ok(existsSync(new URL(file, root)), file);
  }
  assert.ok(existsSync(new URL(manifest.background.service_worker, root)));
});

test('popup footer links to the GitHub bug report form', () => {
  const html = readFileSync(new URL('../popup/popup.html', import.meta.url), 'utf8');
  assert.match(html, /href="https:\/\/github\.com\/dPeluChe\/yush\/issues\/new\?template=bug_report\.yml"/);
  assert.ok(existsSync(new URL('../.github/ISSUE_TEMPLATE/bug_report.yml', import.meta.url)));
});
