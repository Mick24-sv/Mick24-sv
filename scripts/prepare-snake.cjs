const fs = require('node:fs');
const path = require('node:path');

// snk emits a stationary animation when the calendar has no contributions.
// Preserve the real empty grid and let the snake patrol above it.
function prepareSnake(svg) {
  if (!svg.startsWith('<svg') || !svg.includes('class="s s0"')) {
    throw new Error('Expected a generated snk SVG with snake segments.');
  }
  const color = svg.match(/--cs:([^;}]+)/)?.[1];
  if (!/^#[\da-f]{6}$/i.test(color || '')) {
    throw new Error(`Invalid snake color: ${color}`);
  }
  const stationary = /@keyframes s\d+\{0%\{transform:translate\(([^,]+),([^\)]+)\)\}\}/g;
  const segments = [...svg.matchAll(/class="s s\d+"/g)].length;
  const frames = [...svg.matchAll(stationary)];
  if (frames.length !== segments) return svg;

  console.log('Empty calendar: adding an idle patrol without changing contribution cells.');
  const width = Number(svg.match(/viewBox="[^ ]+ [^ ]+ ([\d.]+)/)?.[1]);
  if (!Number.isFinite(width) || width < 100) throw new Error('Invalid SVG width.');
  svg = svg.replace(/100ms/g, '12000ms');
  return svg.replace(stationary, (frame) => {
    const [, name, x, y] = frame.match(/@keyframes (s\d+)\{0%\{transform:translate\(([^,]+),([^\)]+)\)/);
    const start = parseFloat(x);
    const end = start + width - 100;
    return `@keyframes ${name}{0%,100%{transform:translate(${start}px,${y})}50%{transform:translate(${end}px,${y})}}`;
  });
}

if (require.main === module) {
  for (const file of ['github-contribution-grid-snake.svg', 'github-contribution-grid-snake-dark.svg']) {
    const target = path.join('dist', file);
    fs.writeFileSync(target, prepareSnake(fs.readFileSync(target, 'utf8')));
  }
}

module.exports = { prepareSnake };
