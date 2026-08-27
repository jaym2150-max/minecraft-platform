/**
 * Generate raster PWA icons from /public/icon.svg and /public/icon-maskable.svg.
 * Run from apps/web with: node scripts/generate-pwa-icons.mjs
 * Re-run after editing the SVGs to refresh the PNGs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function rasterize(svgPath, sizes, suffix = '') {
  const svg = await readFile(svgPath);
  for (const size of sizes) {
    const out = join(publicDir, `icon-${size}${suffix}.png`);
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer()
      .then((buf) => writeFile(out, buf));
    console.log(`wrote ${out}`);
  }
}

async function main() {
  const anyIcon = join(publicDir, 'icon.svg');
  const maskableIcon = join(publicDir, 'icon-maskable.svg');
  if (!existsSync(anyIcon) || !existsSync(maskableIcon)) {
    console.error('icon.svg or icon-maskable.svg missing under apps/web/public');
    process.exit(1);
  }
  // "any" icon set: 192 + 512 used by Chrome/Edge install surface
  await rasterize(anyIcon, [192, 512]);
  // Maskable 512 used by Android adaptive icon
  await rasterize(maskableIcon, [512], '-maskable');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
