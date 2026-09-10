/**
 * Build a cPanel-ready zip without node_modules, .git, secrets, or local junk.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'project.zip');

const exclude = [
  'node_modules/*',
  '.git/*',
  'data/*',
  '.env',
  '.env.local',
  '.env.*.local',
  'coverage/*',
  '*.log',
  'project.zip',
  '.DS_Store',
  'All/*',
  'agent-transcripts/*',
  'docs/REVIEW-*.md',
  'docs/QA-*.md',
  'nastonas/*'
];

if (fs.existsSync(out)) fs.unlinkSync(out);

const args = ['-r', out, '.', ...exclude.flatMap((pattern) => ['-x', pattern])];
const result = spawnSync('zip', args, { cwd: root, stdio: 'inherit' });
if (result.status !== 0) {
  console.error('zip failed. Ensure the zip CLI is installed.');
  process.exit(result.status || 1);
}
console.log(`Created ${out}`);
