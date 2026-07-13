/**
 * Generates PNG icons for PWA manifest & mobile notifications
 * Uses canvas (built-in Node.js via canvas package) OR creates minimal valid PNGs
 * Run: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// Minimal valid 1x1 transparent PNG header — we'll create colored square PNGs
// using pure Buffer manipulation (no external deps)

function createColorPNG(size, r, g, b) {
  // Build a minimal PNG for a solid-color square
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  function u32(n) {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(n, 0);
    return b;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++)
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeB = Buffer.from(type, "ascii");
    const len = u32(data.length);
    const crcB = u32(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // IHDR: width, height, bitDepth=8, colorType=2 (RGB), compress=0, filter=0, interlace=0
  const ihdr = chunk(
    "IHDR",
    Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])])
  );

  // IDAT: raw scanlines with zlib compression
  const zlib = require("zlib");
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter byte
    for (let x = 0; x < size; x++) {
      raw.push(r, g, b);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));
  const idat = chunk("IDAT", compressed);

  // IEND
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Indigo color matching app theme: #6366f1 = rgb(99, 102, 241)
sizes.forEach((size) => {
  const png = createColorPNG(size, 99, 102, 241);
  const file = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`✅ Created icon-${size}x${size}.png`);
});

// Badge icon (small mono white icon for Android status bar): 72x72 white
const badge = createColorPNG(72, 255, 255, 255);
fs.writeFileSync(path.join(iconsDir, "badge-72x72.png"), badge);
console.log("✅ Created badge-72x72.png");

// Chat action icon
const chatIcon = createColorPNG(72, 99, 102, 241);
fs.writeFileSync(path.join(iconsDir, "chat-icon.png"), chatIcon);
console.log("✅ Created chat-icon.png");

// Close icon
const closeIcon = createColorPNG(72, 239, 68, 68);
fs.writeFileSync(path.join(iconsDir, "close-icon.png"), closeIcon);
console.log("✅ Created close-icon.png");

console.log("\n🎉 All icons generated in public/icons/");
