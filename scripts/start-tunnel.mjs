/**
 * Expo --tunnel uses ngrok (Expo's cloud relay). When ngrok fails, Metro may still start
 * but tunnel mode aborts — use start:lan or USB instead (see package.json).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('Starting Expo with --tunnel (uses ngrok; may fail on some networks)…\n');

const child = spawn('node', ['scripts/run-with-safe-path.mjs', 'npx', 'expo', 'start', '--tunnel', '--clear'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  if (code === 0 || code === null) return;

  console.error(`
Tunnel failed — this is usually NOT a bug in your app.

Why you see "failed to start tunnel" / "remote gone away":
  • expo start --tunnel opens a public URL via ngrok (third-party servers).
  • ngrok can drop the connection (free limits, firewall, VPN, or ngrok outages).
  • Many developers hit this in 2025–2026 when ngrok's API/session limits change.

What to use instead (recommended):
  1. Same Wi‑Fi as your phone:  npm run start:device   (or npm run start:lan)
  2. Android + USB cable:       npm run adb:reverse   then   npm start
  3. Emulator:                  npm run android

Only use start:tunnel when LAN/USB is impossible and ngrok is working for you.
`);
  process.exit(code);
});
