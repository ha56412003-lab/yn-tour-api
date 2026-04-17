const Jimp = require('jimp');

async function dump(name) {
  const img = await Jimp.read('/Users/tiaotiao/.openclaw/workspace-fengxi/yn-tour-miniprogram/yn-tour-distribution/src/static/' + name + '.png');
  const w = img.getWidth(), h = img.getHeight();
  const pixels = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = img.getPixelColor(x, y);
      const a = (p >> 24) & 0xff;
      if (a > 0) {
        const r = (p >> 16) & 0xff, g = (p >> 8) & 0xff, b = p & 0xff;
        pixels.push({x,y,r,g,b,a});
      }
    }
  }
  console.log(name + ': ' + pixels.length + ' colored pixels');
  if (pixels.length > 0) {
    const xs = pixels.map(p=>p.x), ys = pixels.map(p=>p.y);
    console.log('  bounds: x['+Math.min(...xs)+'-'+Math.max(...xs)+'] y['+Math.min(...ys)+'-'+Math.max(...ys)+']');
    const avgR = Math.round(pixels.reduce((s,p)=>s+p.r,0)/pixels.length);
    const avgG = Math.round(pixels.reduce((s,p)=>s+p.g,0)/pixels.length);
    const avgB = Math.round(pixels.reduce((s,p)=>s+p.b,0)/pixels.length);
    console.log('  avg color: ' + avgR + ',' + avgG + ',' + avgB);
    const colors = {};
    pixels.forEach(p => { const k = p.r+','+p.g+','+p.b; colors[k] = (colors[k]||0)+1; });
    const sorted = Object.entries(colors).sort((a,b)=>b[1]-a[1]);
    console.log('  top colors:', sorted.slice(0,5).map(([k,v])=>k+'('+v+')').join(' '));
  }
}

(async () => {
  await dump('tab-home-active');
  await dump('tab-user-active');
  await dump('tab-help-active');
  await dump('tab-booking-active');
})();
