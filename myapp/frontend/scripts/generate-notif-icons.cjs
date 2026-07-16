/**
 * Generates proper notification icons:
 * 1. notif-icon.png  — 512x512 indigo background + white chat bubble (shown next to notification)
 * 2. badge-mono.png  — 96x96 white-on-transparent chat bubble (Android status bar)
 */

const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

const outDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── PNG helpers ──────────────────────────────────────────────────────────────
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

const CRC_TABLE = (() => {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, "ascii");
  return Buffer.concat([u32(data.length), tb, data, u32(crc32(Buffer.concat([tb, data])))]);
}

// colorType 6 = RGBA
function buildPNG(size, getPixel) {
  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk("IHDR", Buffer.concat([u32(size), u32(size), Buffer.from([8, 6, 0, 0, 0])]));

  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y, size);
      raw.push(r, g, b, a);
    }
  }
  const idat = chunk("IDAT", zlib.deflateSync(Buffer.from(raw)));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// ── Draw helpers ─────────────────────────────────────────────────────────────
function dist(x, y, cx, cy) {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
}

// Rounded rectangle check
function inRoundRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false;
  // corners
  const corners = [
    [rx + radius, ry + radius],
    [rx + rw - radius, ry + radius],
    [rx + radius, ry + rh - radius],
    [rx + rw - radius, ry + rh - radius],
  ];
  for (const [cx, cy] of corners) {
    if (x < rx + radius && y < ry + radius && dist(x, y, cx, cy) > radius) return false;
    if (x > rx + rw - radius && y < ry + radius && dist(x, y, cx, cy) > radius) return false;
    if (x < rx + radius && y > ry + rh - radius && dist(x, y, cx, cy) > radius) return false;
    if (x > rx + rw - radius && y > ry + rh - radius && dist(x, y, cx, cy) > radius) return false;
  }
  return true;
}

// ── 1. notif-icon.png — 512x512 indigo bg + white chat bubble ────────────────
{
  const SIZE = 512;
  // Indigo: #6366f1 = rgb(99,102,241)
  const BG = [99, 102, 241];

  const png = buildPNG(SIZE, (x, y, S) => {
    const cx = S / 2, cy = S / 2;

    // Circular background
    const d = dist(x, y, cx, cy);
    if (d > S / 2) return [0, 0, 0, 0]; // transparent outside circle

    // White chat bubble shape (like WhatsApp)
    // Main rounded rectangle body
    const bx = S * 0.18, by = S * 0.20;
    const bw = S * 0.64, bh = S * 0.46;
    const br = S * 0.09;
    const inBody = inRoundRect(x, y, bx, by, bw, bh, br);

    // Tail of bubble (bottom-left triangle)
    const tailTip  = [S * 0.22, S * 0.74];
    const tailBase1 = [S * 0.22, S * 0.66 - 2];
    const tailBase2 = [S * 0.40, S * 0.66 - 2];
    // Simple triangle check using cross product
    function sign(p1x, p1y, p2x, p2y, p3x, p3y) {
      return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
    }
    function inTriangle(px, py, ax, ay, bx2, by2, cx2, cy2) {
      const d1 = sign(px, py, ax, ay, bx2, by2);
      const d2 = sign(px, py, bx2, by2, cx2, cy2);
      const d3 = sign(px, py, cx2, cy2, ax, ay);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      return !(hasNeg && hasPos);
    }
    const inTail = inTriangle(
      x, y,
      tailTip[0], tailTip[1],
      tailBase1[0], tailBase1[1],
      tailBase2[0], tailBase2[1]
    );

    // Three dots inside bubble
    const dotY = by + bh / 2;
    const dot1 = dist(x, y, S * 0.35, dotY) < S * 0.045;
    const dot2 = dist(x, y, S * 0.50, dotY) < S * 0.045;
    const dot3 = dist(x, y, S * 0.65, dotY) < S * 0.045;

    if (inBody || inTail) {
      if (dot1 || dot2 || dot3) {
        // Dots are indigo colored (same as background — creates cutout effect)
        return [...BG, 255];
      }
      return [255, 255, 255, 255]; // white bubble
    }

    return [...BG, 255]; // indigo background
  });

  fs.writeFileSync(path.join(outDir, "notif-icon.png"), png);
  console.log("✅ notif-icon.png (512x512)");
}

// ── 2. badge-mono.png — 96x96 white chat bubble on transparent bg ─────────────
{
  const SIZE = 96;

  const png = buildPNG(SIZE, (x, y, S) => {
    const bx = S * 0.08, by = S * 0.08;
    const bw = S * 0.84, bh = S * 0.58;
    const br = S * 0.12;
    const inBody = inRoundRect(x, y, bx, by, bw, bh, br);

    const tailTip   = [S * 0.18, S * 0.88];
    const tailBase1 = [S * 0.18, S * 0.66];
    const tailBase2 = [S * 0.40, S * 0.66];
    function sign(p1x, p1y, p2x, p2y, p3x, p3y) {
      return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
    }
    function inTriangle(px, py, ax, ay, bx2, by2, cx2, cy2) {
      const d1 = sign(px, py, ax, ay, bx2, by2);
      const d2 = sign(px, py, bx2, by2, cx2, cy2);
      const d3 = sign(px, py, cx2, cy2, ax, ay);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    }
    const inTail = inTriangle(
      x, y,
      tailTip[0], tailTip[1],
      tailBase1[0], tailBase1[1],
      tailBase2[0], tailBase2[1]
    );

    if (inBody || inTail) return [255, 255, 255, 255];
    return [0, 0, 0, 0]; // transparent
  });

  fs.writeFileSync(path.join(outDir, "badge-mono.png"), png);
  console.log("✅ badge-mono.png (96x96)");
}

console.log("\n🎉 Notification icons ready in public/icons/");
