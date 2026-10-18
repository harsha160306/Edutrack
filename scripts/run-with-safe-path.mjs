/**
 * Android cannot mmap the JS bundle when the project path contains spaces
 * (JSBigFileString::fromPath - Could not open file).
 *
 * On Windows, creates a directory junction under %LOCALAPPDATA%\dev\MICFacultyApp
 * and re-runs the requested command from that path (no spaces).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/run-with-safe-path.mjs <command> [args...]');
  process.exit(1);
}

const normalize = (p) => path.resolve(p).replace(/\\/g, '/').toLowerCase();

const hasSpaces = /\s/.test(root);

if (!hasSpaces) {
  const result = spawnSync(args[0], args.slice(1), {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

if (process.platform !== 'win32') {
  console.error(`
Project path contains spaces and Android cannot load the bundle from it:
  ${root}

Move or clone the project to a path without spaces, e.g.
  ~/dev/MICFacultyApp
`);
  process.exit(1);
}

const linkRoot =
  process.env.MIC_FACULTY_DEV_ROOT ||
  path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'dev', 'MICFacultyApp');

function junctionTarget(link) {
  try {
    return fs.readlinkSync(link);
  } catch {
    return null;
  }
}

function ensureJunction() {
  fs.mkdirSync(path.dirname(linkRoot), { recursive: true });

  if (fs.existsSync(linkRoot)) {
    const target = junctionTarget(linkRoot);
    if (target && normalize(target) === normalize(root)) {
      return;
    }
    console.error(`
Junction already exists but points elsewhere:
  ${linkRoot}
  → ${target ?? '(not a junction)'}

Remove it manually, then run again:
  rmdir "${linkRoot}"
`);
    process.exit(1);
  }

  const mklink = spawnSync('cmd', ['/c', 'mklink', '/J', linkRoot, root], {
    stdio: 'inherit',
    shell: false,
  });

  if (mklink.status !== 0) {
    console.error(`
Could not create junction (Android needs a path without spaces):
  ${linkRoot} → ${root}

Try manually (Command Prompt):
  mkdir "${path.dirname(linkRoot)}" 2>nul
  mklink /J "${linkRoot}" "${root}"

Or move the project to e.g. C:\\dev\\MICFacultyApp
`);
    process.exit(mklink.status ?? 1);
  }

  console.log(`\n✓ Dev junction created (fixes JSBigFileString on Android):\n  ${linkRoot}\n`);
}

ensureJunction();

const junctionEnv = {
  ...process.env,
  MIC_FACULTY_PROJECT_ROOT: root,
  MIC_FACULTY_DEV_ROOT: linkRoot,
};

if (normalize(process.cwd()) !== normalize(linkRoot)) {
  console.log(`Running from junction (no spaces in path):\n  ${linkRoot}\n`);
}

const result = spawnSync(args[0], args.slice(1), {
  cwd: linkRoot,
  stdio: 'inherit',
  shell: true,
  env: junctionEnv,
});
process.exit(result.status ?? 1);
