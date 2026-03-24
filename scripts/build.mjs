import { context } from 'esbuild';
import { cp, mkdir, watch as fsWatch } from 'fs/promises';
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
  ['popup/popup.css', 'popup/popup.css']
];

async function copyStaticFiles() {
  await Promise.all(
    staticFiles.map(([src, dest]) =>
      cp(resolve(projectRoot, src), resolve(distDir, dest))
    )
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
  await mkdir(distDir, { recursive: true });

  const ctx = await context({
    entryPoints: {
      'background/background': resolve(projectRoot, 'background/background.js'),
      'content/youtube-content': resolve(projectRoot, 'content/youtube-content.js'),
      'content/google-content': resolve(projectRoot, 'content/google-content.js'),
      'content/external-content': resolve(projectRoot, 'content/external-content.js'),
      'content/hider': resolve(projectRoot, 'content/hider.js'),
      'popup/popup': resolve(projectRoot, 'popup/popup.js'),
    },
    outdir: distDir,
    bundle: true,
    format: 'esm',
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
