import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon resource
  header.writeUInt16LE(images.length, 4); // count

  let offset = 6 + (16 * images.length);
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function main() {
  const jsonPath = resolve(__dirname, 'generated/image-data.json');
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));

  if (!data.logo?.dataUri) {
    throw new Error('HavFun logo not found in image-data.json');
  }

  const base64Data = data.logo.dataUri.split(';base64,').pop();
  const rawBuf = Buffer.from(base64Data, 'base64');

  // Trim transparent borders to get clean bounding box
  const trimmed = await sharp(rawBuf).trim().toBuffer({ resolveWithObject: true });
  console.log(`Trimmed logo bounds: ${trimmed.info.width}x${trimmed.info.height}`);

  // Base high-res square logo (512x512) with minimal 4% padding
  const baseSize = 512;
  const padding = Math.round(baseSize * 0.04);
  const innerSize = baseSize - (padding * 2);

  const squareLogoBuffer = await sharp(trimmed.data)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // 1. High-res logo assets
  await writeFile(resolve(PUBLIC_DIR, 'logo.png'), squareLogoBuffer);
  const webpBuffer = await sharp(squareLogoBuffer).webp({ quality: 90 }).toBuffer();
  await writeFile(resolve(PUBLIC_DIR, 'logo.webp'), webpBuffer);
  console.log('✓ Wrote public/logo.png and public/logo.webp');

  // 2. Favicon PNGs
  const png16 = await sharp(squareLogoBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(squareLogoBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(squareLogoBuffer).resize(48, 48).png().toBuffer();
  const png64 = await sharp(squareLogoBuffer).resize(64, 64).png().toBuffer();
  const png128 = await sharp(squareLogoBuffer).resize(128, 128).png().toBuffer();
  const png180 = await sharp(squareLogoBuffer).resize(180, 180).png().toBuffer();
  const png256 = await sharp(squareLogoBuffer).resize(256, 256).png().toBuffer();

  await writeFile(resolve(PUBLIC_DIR, 'favicon-16x16.png'), png16);
  await writeFile(resolve(PUBLIC_DIR, 'favicon-32x32.png'), png32);
  await writeFile(resolve(PUBLIC_DIR, 'apple-touch-icon.png'), png180);
  console.log('✓ Wrote favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png');

  // 3. Multi-resolution favicon.ico
  const icoImages = [
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
    { width: 64, height: 64, buffer: png64 },
    { width: 128, height: 128, buffer: png128 },
    { width: 256, height: 256, buffer: png256 },
  ];
  const icoBuf = buildIco(icoImages);
  await writeFile(resolve(PUBLIC_DIR, 'favicon.ico'), icoBuf);
  console.log('✓ Wrote public/favicon.ico with 6 resolutions');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
