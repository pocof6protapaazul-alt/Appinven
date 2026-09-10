import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, 'icon-source.svg'));
const publicDir = resolve(__dirname, '..', 'public');

const targets = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of targets) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}
console.log('Íconos generados correctamente.');
