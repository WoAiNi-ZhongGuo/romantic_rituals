import { writeFileSync } from 'fs';
import { PNG } from 'pngjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function heartShape(x, y, w, h) {
  // Normalize to [-1, 1]
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const sh = (h / w) * 1.2;

  // Parametric heart: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const hx = nx;
  const hy = ny * sh + 0.15;
  const val = Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * Math.pow(Math.abs(hy), 3);
  return val <= 0;
}

function generateIcon(size) {
  const png = new PNG({
    width: size,
    height: size,
    colorType: 6, // RGBA
  });

  const pink = [236, 72, 153]; // love-500
  const lightPink = [249, 168, 212]; // love-300

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const isHeart = heartShape(x, y, size, size);
      if (isHeart) {
        // Gradient effect
        const dist = Math.sqrt(
          Math.pow(x / size - 0.5, 2) + Math.pow(y / size - 0.35, 2)
        ) * 2;
        const blend = Math.min(dist, 1);
        png.data[idx] = Math.round(pink[0] * (1 - blend) + lightPink[0] * blend);
        png.data[idx + 1] = Math.round(pink[1] * (1 - blend) + lightPink[1] * blend);
        png.data[idx + 2] = Math.round(pink[2] * (1 - blend) + lightPink[2] * blend);
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
  }

  return PNG.sync.write(png);
}

const outDir = resolve(__dirname, '..', 'public', 'icons');

for (const size of [192, 512]) {
  const buffer = generateIcon(size);
  writeFileSync(resolve(outDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Generated icon-${size}x${size}.png`);
}

console.log('Done!');
