const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

function updateSnakeLinks(readme, repository, sha) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error('Expected a GitHub repository and full output commit SHA.');
  }
  const escaped = repository.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`https://raw\\.githubusercontent\\.com/${escaped}/(?:output|[a-f0-9]{40})/(github-contribution-grid-snake(?:-dark)?\\.svg)(?:\\?[^"\\s]*)?`, 'g');
  const matches = [...readme.matchAll(pattern)];
  if (matches.length !== 3) throw new Error('Expected light, dark, and fallback snake URLs.');
  return readme.replace(pattern, `https://raw.githubusercontent.com/${repository}/${sha}/$1`);
}

if (require.main === module) {
  const repository = process.env.GITHUB_REPOSITORY;
  const ref = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/output'], { encoding: 'utf8' }).trim();
  const sha = ref.split(/\s+/)[0];
  // Use the latest README so a scheduled run preserves recent profile edits.
  execFileSync('git', ['pull', '--ff-only', 'origin', 'main'], { stdio: 'inherit' });
  const before = fs.readFileSync('README.md', 'utf8');
  const after = updateSnakeLinks(before, repository, sha);
  if (after !== before) {
    fs.writeFileSync('README.md', after);
    execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
    execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
    execFileSync('git', ['add', '--', 'README.md']);
    execFileSync('git', ['commit', '-m', 'Refresh contribution snake image URLs']);
    execFileSync('git', ['push', 'origin', 'HEAD:main'], { stdio: 'inherit' });
  }
}

module.exports = { updateSnakeLinks };
