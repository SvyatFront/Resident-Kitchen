/**
 * convert-images.js
 * Converts all PNG images to WebP with appropriate sizes.
 * Run: node convert-images.js
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const IMAGES_DIR = path.join(__dirname, 'images');

const tasks = [
  // Hero: resize to max 1440px wide (it's used as full-screen bg)
  {
    src:  'hero/hero-bg.png',
    dest: 'hero/hero-bg.webp',
    width: 1440,
    quality: 82,
  },
  // Gallery cards: displayed max ~540px on desktop, ~100vw on mobile
  { src: 'gallery/modern.png',        dest: 'gallery/modern.webp',        width: 800, quality: 80 },
  { src: 'gallery/classic.png',       dest: 'gallery/classic.webp',       width: 800, quality: 80 },
  { src: 'gallery/minimal.png',       dest: 'gallery/minimal.webp',       width: 800, quality: 80 },
  { src: 'gallery/neoclassic.png',    dest: 'gallery/neoclassic.webp',    width: 800, quality: 80 },
  { src: 'gallery/loft.png',          dest: 'gallery/loft.webp',          width: 800, quality: 80 },
  { src: 'gallery/premium-island.png',dest: 'gallery/premium-island.webp',width: 800, quality: 80 },
];

async function run() {
  for (const t of tasks) {
    const src  = path.join(IMAGES_DIR, t.src);
    const dest = path.join(IMAGES_DIR, t.dest);

    if (!fs.existsSync(src)) {
      console.warn(`⚠  Not found: ${t.src}`);
      continue;
    }

    const before = fs.statSync(src).size;

    await sharp(src)
      .resize({ width: t.width, withoutEnlargement: true })
      .webp({ quality: t.quality, effort: 5 })
      .toFile(dest);

    const after = fs.statSync(dest).size;
    const saved = ((1 - after / before) * 100).toFixed(1);
    console.log(`✓  ${t.dest.padEnd(36)} ${kb(before).padStart(8)} → ${kb(after).padStart(8)}  (saved ${saved}%)`);
  }
  console.log('\nDone! Update your HTML to use .webp sources.');
}

function kb(bytes) { return (bytes / 1024).toFixed(0) + ' KB'; }

run().catch(console.error);
