/**
 * Forwards Metro / Expo dev ports from the USB device to this PC.
 */
import { execSync, spawnSync } from 'node:child_process';

const PORTS = [8081, 19000, 19001];

function hasAdbDevice() {
  try {
    const out = execSync('adb devices', { encoding: 'utf8' });
    return out.split(/\r?\n/).some((line) => /^\S+\s+device\s*$/i.test(line));
  } catch {
    return false;
  }
}

if (!hasAdbDevice()) {
  console.warn('adb: no device in "device" state — skip port reverse (use Wi‑Fi / emulator or plug in USB).');
  process.exit(0);
}

let failed = false;
for (const port of PORTS) {
  const result = spawnSync('adb', ['reverse', `tcp:${port}`, `tcp:${port}`], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status === 0) {
    console.log(`adb reverse tcp:${port} tcp:${port}`);
  } else {
    failed = true;
    console.warn(`adb reverse tcp:${port} failed: ${result.stderr || result.stdout || 'unknown'}`);
  }
}

if (failed) {
  process.exit(1);
}
