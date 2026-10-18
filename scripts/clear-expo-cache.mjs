/**
 * Removes stale Expo / Metro caches (fixes old JS bundles still running in the app).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = ['.expo', 'node_modules/.cache'];

for (const name of targets) {
  const dir = path.join(root, name);
  if (!fs.existsSync(dir)) continue;
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Removed ${name}`);
}

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (!entry.name.startsWith('.expo-tmp')) continue;
  const dir = path.join(root, entry.name);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Removed ${entry.name}`);
}

console.log('Cache cleared.\n');
