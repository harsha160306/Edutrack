/**
 * Web dev: clear stale caches → Expo web with --clear.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

function runNode(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [script], { cwd: root, stdio: 'inherit', shell: isWin });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}

console.log('Preparing web dev environment…\n');

await runNode(path.join('scripts', 'clear-expo-cache.mjs'));

const child = spawn(
  'node',
  ['scripts/run-with-safe-path.mjs', 'npx', 'expo', 'start', '--web', '--clear'],
  { cwd: root, stdio: 'inherit', shell: isWin },
);

child.on('exit', (code) => process.exit(code ?? 0));
