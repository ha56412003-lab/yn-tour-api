const Jimp = require('jimp');

const SIZE = 50;
const STATIC = '/Users/tiaotiao/.openclaw/workspace-fengxi/yn-tour-miniprogram/yn-tour-distribution/src/static';

// Color: purple #9179F0 (matches existing home/user icons)
const COL = { r: 145, g: 121, b: 240 };
const FILL = 0xFF9179F0;
const OUTLINE = 0x7D6ACC; // slightly darker outline

// Helper: set pixel (clip to bounds)
function px(draw, w, h, x, y, color) {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const idx = (y * w + x) * 4;
  draw[idx]   = (color >> 24) & 0xff;
  draw[idx+1] = (color >> 16) & 0xff;
  draw[idx+2] = (color >> 8)  & 0xff;
  draw[idx+3] = color & 0xff;
}

// Fill rectangle
function fillRect(draw, w, h, x1, y1, x2, y2, color) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      px(draw, w, h, x, y, color);
}

// Fill polygon (scanline algorithm)
function fillPoly(draw, w, h, points, color) {
  const n = points.length;
  const nodes = [];
  for (let y = 0; y < h; y++) {
    nodes.length = 0;
    let j = n - 1;
    for (let i = 0; i < n; i++) {
      const pi = points[i], pj = points[j];
      if ((pi.y < y && pj.y >= y) || (pj.y < y && pi.y >= y)) {
        const x = Math.round(pi.x + (y - pi.y) / (pj.y - pi.y) * (pj.x - pi.x));
        nodes.push(x);
      }
      j = i;
    }
    nodes.sort((a, b) => a - b);
    for (let i = 0; i < nodes.length - 1; i += 2) {
      const x0 = nodes[i], x1 = nodes[i + 1];
      for (let x = x0; x <= x1; x++) px(draw, w, h, x, y, color);
    }
  }
}

// Fill ellipse
function fillEllipse(draw, w, h, cx, cy, rx, ry, color) {
  ry = Math.max(1, ry);
  rx = Math.max(1, rx);
  for (let y = cy - ry - 1; y <= cy + ry + 1; y++) {
    for (let x = cx - rx - 1; x <= cx + rx + 1; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) px(draw, w, h, x, y, color);
    }
  }
}

function drawHome(draw, w, h, color, outline) {
  // House shape: roof triangle + body rectangle + door
  // Roof: points (25,6),(7,24),(43,24)
  fillPoly(draw, w, h, [[25,5],[6,23],[44,23]], color);
  // Body: filled rect with cutout for door
  fillRect(draw, w, h, 11, 23, 39, 45, color);
  // Door
  fillRect(draw, w, h, 20, 30, 30, 45, outline);
  // Chimney
  fillRect(draw, w, h, 33, 8, 37, 18, color);
  // Window left
  fillRect(draw, w, h, 13, 27, 18, 32, outline);
  // Window right
  fillRect(draw, w, h, 32, 27, 37, 32, outline);
}

function drawUser(draw, w, h, color, outline) {
  // Person: head circle + body rounded shape
  // Head
  fillEllipse(draw, w, h, 25, 17, 8, 8, color);
  // Body (shoulders/torso) - trapezoid-ish
  fillPoly(draw, w, h, [[10,42],[40,42],[37,28],[13,28]], color);
  // Body is a wide rounded shape - let's just fill a wide area
  fillEllipse(draw, w, h, 25, 37, 16, 12, color);
  // Head inner (eye area detail)
  // Simple: just big head + body
}

function drawHelp(draw, w, h, color, outline) {
  // Document with folded corner
  const bx = 12, by = 7, bw = 26, bh = 36, fs = 9;
  // Main body (rect with clipped top-right fold area)
  // Draw main body with fold
  for (let y = by; y <= by + bh; y++) {
    for (let x = bx; x <= bx + bw; x++) {
      const inFold = (x >= bx + bw - fs) && (y <= by + fs) && ((x - (bx + bw - fs)) + (by + fs - y) < fs);
      if (!inFold) px(draw, w, h, x, y, color);
    }
  }
  // Fold triangle
  for (let i = 0; i < fs; i++) {
    for (let j = 0; j < fs - i; j++) {
      px(draw, w, h, bx + bw - fs + i, by + j, outline);
    }
  }
  // Text lines
  const lineColor = outline;
  for (let lx = bx + 4; lx <= bx + bw - fs - 3; lx++) {
    for (let y = by + 12; y <= by + 13; y++) px(draw, w, h, lx, y, lineColor);
    for (let y = by + 18; y <= by + 19; y++) px(draw, w, h, lx, y, lineColor);
    for (let y = by + 24; y <= by + 25; y++) px(draw, w, h, lx, y, lineColor);
    for (let y = by + 30; y <= by + 31; y++) px(draw, w, h, lx, y, lineColor);
  }
}

function drawTicket(draw, w, h, color, outline) {
  // Ticket: rounded rect with notches on sides
  const tx = 7, ty = 13, tw = 36, th = 24, nr = 5;
  for (let y = ty; y <= ty + th; y++) {
    for (let x = tx; x <= tx + tw; x++) {
      // Left notch semicircle
      const ldx = x - tx;
      const ldy = Math.abs(y - (ty + th / 2));
      const leftNotch = ldx < nr && ldy >= nr - ldx;
      // Right notch
      const rdx = tx + tw - x;
      const rdy = Math.abs(y - (ty + th / 2));
      const rightNotch = rdx < nr && rdy >= nr - rdx;
      if (leftNotch || rightNotch) continue;
      px(draw, w, h, x, y, color);
    }
  }
  // Vertical dashed line
  for (let y = ty + 4; y < ty + th - 3; y += 3) {
    for (let x = 24; x <= 25; x++) px(draw, w, h, x, y, outline);
  }
  // Barcode lines left
  const bars = [11, 13, 16, 19, 21];
  for (const bx of bars) {
    for (let y = ty + 5; y < ty + th - 4; y++) px(draw, w, h, bx, y, outline);
  }
}

function makeIcon(drawFn, color, outline) {
  const img = new Jimp(SIZE, SIZE, 0x00000000);
  const draw = img.bitmap.data;
  drawFn(draw, SIZE, SIZE, color, outline);
  return img;
}

(async () => {
  const c = FILL, o = OUTLINE;

  const home    = makeIcon(drawHome, c, o);
  const user    = makeIcon(drawUser, c, o);
  const help    = makeIcon(drawHelp, c, o);
  const ticket  = makeIcon(drawTicket, c, o);

  await home.writeAsync(STATIC + '/tab-home-active.png');
  await home.writeAsync(STATIC + '/tab-home.png');
  await user.writeAsync(STATIC + '/tab-user-active.png');
  await user.writeAsync(STATIC + '/tab-user.png');
  await help.writeAsync(STATIC + '/tab-help-active.png');
  await help.writeAsync(STATIC + '/tab-help.png');
  await ticket.writeAsync(STATIC + '/tab-booking-active.png');
  await ticket.writeAsync(STATIC + '/tab-booking.png');

  console.log('All 4 icons done!');
})();
