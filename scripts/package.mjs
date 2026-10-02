// Builds dist/ and zips it into builds/yush-v<version>.zip for the Chrome Web Store.
import { execFileSync } from 'child_process';
import { mkdir, readFile, rm } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

if (pkg.version !== version) {
  console.error(`Version mismatch: package.json ${pkg.version} vs manifest.json ${version}`);
  process.exit(1);
}

execFileSync('node', [resolve(root, 'scripts/build.mjs')], { stdio: 'inherit' });

const outDir = resolve(root, 'builds');
const zipPath = resolve(outDir, `yush-v${version}.zip`);
await mkdir(outDir, { recursive: true });
await rm(zipPath, { force: true });

try {
  execFileSync('zip', ['-r', '-X', zipPath, '.', '-x', '*.map', '.DS_Store', '*/.DS_Store'], {
    cwd: resolve(root, 'dist'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('zip failed (is the `zip` CLI installed?):', error.message);
  process.exit(1);
}

console.log(`Package ready: ${zipPath}`);
