// Builds dist/ and zips it into builds/yush-v<version>.zip for the Chrome Web Store.
import { execFileSync } from 'child_process';
import { mkdir, readFile, rm } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const { version } = manifest;
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const listing = await readFile(resolve(root, 'docs/STORE/LISTING.md'), 'utf8');

const problems = [];
if (pkg.version !== version) problems.push(`version mismatch: package.json ${pkg.version} vs manifest.json ${version}`);
if (manifest.name.length > 75) problems.push(`manifest name is ${manifest.name.length} chars (store limit 75)`);
if (manifest.description.length > 132) problems.push(`manifest description is ${manifest.description.length} chars (store limit 132)`);
if (!listing.includes(manifest.name)) problems.push('manifest name differs from docs/STORE/LISTING.md');
if (!listing.includes(manifest.description)) problems.push('manifest description differs from docs/STORE/LISTING.md');
if (problems.length) {
  console.error(`Package aborted:\n- ${problems.join('\n- ')}`);
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
