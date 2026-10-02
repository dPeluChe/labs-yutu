import { context } from 'esbuild';
import { cp, mkdir, rm, watch as fsWatch } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');

const isWatchMode = process.argv.includes('--watch');

const staticFiles = [
  ['manifest.json', 'manifest.json'],
  ['content/content.css', 'content/content.css'],
  ['popup/popup.html', 'popup/popup.html'],
  ['popup/popup.css', 'popup/popup.css'],
  ['icons/icon16.png', 'icons/icon16.png'],
  ['icons/icon48.png', 'icons/icon48.png'],
  ['icons/icon128.png', 'icons/icon128.png']
];

async function copyStaticFiles() {
  await Promise.all(
    staticFiles.map(async ([src, dest]) => {
      const target = resolve(distDir, dest);
      await mkdir(dirname(target), { recursive: true });
      await cp(resolve(projectRoot, src), target);
    })
  );
}

async function watchStaticFiles() {
  for (const [src, dest] of staticFiles) {
    const fullPath = resolve(projectRoot, src);
    try {
      const watcher = fsWatch(fullPath);
      (async () => {
        for await (const event of watcher) {
          if (event.eventType === 'change') {
            try {
              await cp(resolve(projectRoot, src), resolve(distDir, dest));
              console.log(`Updated: ${src}`);
            } catch (err) {
              console.error(`Error copying ${src}:`, err.message);
            }
          }
        }
      })();
    } catch {
      // File may not exist yet, skip
    }
  }
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const ctx = await context({
    entryPoints: {
      'background/background': resolve(projectRoot, 'background/background.js'),
      'content/youtube-content': resolve(projectRoot, 'content/youtube-content.js'),
      'content/external-content': resolve(projectRoot, 'content/external-content.js'),
      'content/hider': resolve(projectRoot, 'content/hider.js'),
      'popup/popup': resolve(projectRoot, 'popup/popup.js'),
    },
    outdir: distDir,
    bundle: true,
    format: 'iife',
    target: ['chrome110'],
    minify: !isWatchMode,
    sourcemap: isWatchMode,
    entryNames: '[dir]/[name]',
    loader: {
      '.png': 'file',
      '.svg': 'file'
    }
  });

  await copyStaticFiles();

  if (isWatchMode) {
    await ctx.watch();
    watchStaticFiles();
    console.log('Watch mode active - waiting for changes...');

    process.on('SIGINT', async () => {
      await ctx.dispose();
      process.exit(0);
    });
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('Build complete');
  }
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
