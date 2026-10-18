/**
 * Reliable Android dev start (USB): free Metro port → adb reverse → Expo on localhost.
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

console.log('Preparing Android dev environment…\n');

await runNode(path.join('scripts', 'free-metro-port.mjs'));
await runNode(path.join('scripts', 'clear-expo-cache.mjs'));
await runNode(path.join('scripts', 'adb-reverse-all.mjs'));

console.log(`
Starting Metro (localhost + clear cache).
• Phone on USB: open the app and Reload (shake → Reload, or press R in this terminal).
• No USB: use npm run start:device (LAN) on the same Wi‑Fi instead.
`);

const expo = spawn('node', ['scripts/run-with-safe-path.mjs', 'npx', 'expo', 'start', '--localhost', '--clear'], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: '127.0.0.1' },
});

expo.on('exit', (code) => process.exit(code ?? 0));
