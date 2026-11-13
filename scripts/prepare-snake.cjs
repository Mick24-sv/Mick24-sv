const fs = require('node:fs');
const path = require('node:path');

// Validate upstream output without changing contribution cells or animation paths.
function prepareSnake(svg) {
  if (!svg.startsWith('<svg') || !svg.includes('class="s s0"')) {
    throw new Error('Expected a generated snk SVG with snake segments.');
  }
  const color = svg.match(/--cs:([^;}]+)/)?.[1];
  if (!/^#[\da-f]{6}$/i.test(color || '')) {
    throw new Error(`Invalid snake color: ${color}`);
  }
  if (!svg.includes('@keyframes s0')) {
    throw new Error('Snake animation keyframes are missing.');
  }
  if (!svg.includes('class="c"') && !svg.includes('class="c ')) {
    throw new Error('Contribution calendar cells are missing.');
  }
  return svg;
}

if (require.main === module) {
  for (const file of ['github-contribution-grid-snake.svg', 'github-contribution-grid-snake-dark.svg']) {
    const target = path.join('dist', file);
    prepareSnake(fs.readFileSync(target, 'utf8'));
    console.log('Validated unmodified contribution animation: ' + file);
  }
}

module.exports = { prepareSnake };
