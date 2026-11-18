const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { value = clamp(value); return value * value * (3 - 2 * value); };
const hashCache = new Map();
function hash(value) {
  if (Number.isInteger(value)) {
    let cached = hashCache.get(value);
    if (cached !== undefined) return cached;
    cached = Math.abs(Math.sin(value * 127.1 + 311.7) * 43758.5453) % 1;
    hashCache.set(value, cached);
    return cached;
  }
  return Math.abs(Math.sin(value * 127.1 + 311.7) * 43758.5453) % 1;
}
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  return (hash(ix + iy * 157) * (1 - fx) + hash(ix + 1 + iy * 157) * fx) * (1 - fy)
    + (hash(ix + (iy + 1) * 157) * (1 - fx) + hash(ix + 1 + (iy + 1) * 157) * fx) * fy;
}
const field2 = (x, y) => noise2(x, y) * .53 + noise2(x * 2.07 + 17, y * 2.07 + 31) * .27
  + noise2(x * 4.31 + 51, y * 4.31) * .13 + noise2(x * 9.1, y * 9.1 + 19) * .07;

onmessage = event => {
  try {
    const { surface, width, height } = event.data;
    const mw = Math.min(540, Math.max(320, Math.round(width * .38)));
    const mh = Math.max(1, Math.round(mw * height / width));
    surface.width = mw;
    surface.height = mh;
    const context = surface.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) throw new Error('Canvas context unavailable');
    context.fillStyle = '#020407';
    context.fillRect(0, 0, mw, mh);
    postMessage('first-frame');
    const image = context.createImageData(mw, mh), pixels = image.data, length = mw * mh;
    const field = new Float32Array(length), grain = new Float32Array(length);
    const glow = new Float32Array(length), vapor = new Float32Array(length);
    let minimum = Infinity, maximum = -Infinity;
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const i = y * mw + x, u = x / mw, v = y / mh, n = field2(u * 3.5, v * 3.2);
      const warpX = u + (n - .5) * .38;
      const warpY = v + (field2(u * 3.2 + 71, v * 3.7) - .5) * .32;
      const distance = Math.hypot((warpX - .48) * 1.18, (warpY - .46) * .9);
      const ridges = field2(u * 25 + n * 3, v * 32 + n * 4);
      const outside = distance * .76 + (n - .5) * .37 + (ridges - .5) * .03;
      const value = outside;
      field[i] = value; minimum = Math.min(minimum, value); maximum = Math.max(maximum, value);
      grain[i] = hash(i * .713);
      const angle = Math.atan2((v - .46) * .9, (u - .48) * 1.18);
      const directional = .5 + .5 * Math.cos(angle + Math.PI * .75);
      glow[i] = clamp(.12 + .78 * directional + .07 * Math.sin(angle * 3 + .6));
      vapor[i] = .35 + .9 * field2(u * 16 + 23, v * 19 + 47);
    }
    const samples = 2048, alpha = new Float32Array(samples), near = new Float32Array(samples);
    const far = new Float32Array(samples), light = new Float32Array(samples * 64);
    for (let sample = 0; sample < samples; sample++) {
      const edge = -.14 + sample * .32 / (samples - 1);
      alpha[sample] = smooth((edge + .034) / .068);
      near[sample] = Math.exp(-Math.abs(edge) * 34);
      far[sample] = Math.exp(-Math.abs(edge) * 22);
      for (let bucket = 0; bucket < 64; bucket++) {
        const size = .004 + bucket / 63 * .006;
        light[bucket * samples + sample] = Math.exp(-edge * edge / (size * size));
      }
    }
    const paint = progress => {
      const threshold = minimum + .012 + progress * (maximum - minimum + .056);
      for (let i = 0; i < length; i++) {
        const edge = field[i] - threshold, offset = i * 4;
        if (edge < -.14) { pixels[offset + 3] = 0; continue; }
        if (edge > .18) {
          pixels[offset] = 2; pixels[offset + 1] = 4; pixels[offset + 2] = 7; pixels[offset + 3] = 255;
          continue;
        }
        const patch = glow[i];
        const sample = Math.min(samples - 1, Math.max(0, Math.round((edge + .14) * (samples - 1) / .32)));
        const brightness = light[Math.round(patch * 63) * samples + sample]
          * (.35 + patch * .85) * .96 * (.94 + grain[i] * .06);
        const mist = near[sample] * (.04 + patch * .05) + far[sample] * (.03 + patch * .03) * vapor[i];
        const sheen = brightness * .095;
        pixels[offset] = Math.min(255, brightness * (150 + patch * 78) + mist * 117 + sheen * 225);
        pixels[offset + 1] = Math.min(255, brightness * (203 + patch * 39) + mist * 172 + sheen * 242);
        pixels[offset + 2] = Math.min(255, brightness * (240 + patch * 15) + mist * 218 + sheen * 255);
        pixels[offset + 3] = Math.max(alpha[sample], Math.min(1, brightness + mist + sheen) * .8) * 255;
      }
      context.putImageData(image, 0, 0);
    };
    paint(0);
    const start = performance.now();
    let contentReleased = false;
    const paintTimes = [];
    const nextFrame = callback => typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(callback) : setTimeout(() => callback(performance.now()), 16);
    function frame(now) {
      const t = clamp((now - start) / 1200);
      const paintStart = performance.now();
      paint(.45 * t + .55 * smooth(t));
      if (!contentReleased && t >= .12) {
        contentReleased = true;
        postMessage('reveal-content');
      }
      paintTimes.push(performance.now() - paintStart);
      if (t < 1) nextFrame(frame);
      else {
        paintTimes.sort((a, b) => a - b);
        postMessage({ type: 'done', frames: paintTimes.length, paintP95Ms: paintTimes[Math.floor(paintTimes.length * .95)] });
      }
    }
    nextFrame(frame);
  } catch { postMessage('error'); }
};
