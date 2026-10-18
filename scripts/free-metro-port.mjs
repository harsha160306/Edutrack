/**
 * Frees Metro's default port (8081) on Windows when a stale dev server is still running.
 */
import { execSync } from 'node:child_process';

const PORT = process.env.METRO_PORT || '8081';

function freePortWindows(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // Port is free — nothing to do.
  }
}

if (process.platform === 'win32') {
  freePortWindows(PORT);
}
