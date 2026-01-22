import { build } from 'esbuild';
import { cp, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');

async function main() {
  await mkdir(distDir, { recursive: true });

  await build({
    entryPoints: {
      'background/background': resolve(projectRoot, 'background/background.js'),
      'content/content': resolve(projectRoot, 'content/content.js'),
      'content/hider': resolve(projectRoot, 'content/hider.js'),
      'popup/popup': resolve(projectRoot, 'popup/popup.js'),
    },
    outdir: distDir,
    bundle: true,
    format: 'esm',
    target: ['chrome110'],
    sourcemap: true,
    entryNames: '[dir]/[name]',
    loader: {
        '.png': 'file',
        '.svg': 'file'
    }
  });

  await Promise.all([
    cp(resolve(projectRoot, 'manifest.json'), resolve(distDir, 'manifest.json')),
    cp(resolve(projectRoot, 'content/content.css'), resolve(distDir, 'content/content.css')),
    cp(resolve(projectRoot, 'popup/popup.html'), resolve(distDir, 'popup/popup.html')),
    cp(resolve(projectRoot, 'popup/popup.css'), resolve(distDir, 'popup/popup.css'))
  ]);

  console.log('Build complete');
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
