/**
 * @deprecated Use run-with-safe-path.mjs (auto junction on Windows).
 * Kept for android-dev.mjs preflight message only.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));

if (/\s/.test(root)) {
  const link =
    process.env.MIC_FACULTY_DEV_ROOT ||
    path.join(process.env.LOCALAPPDATA || '', 'dev', 'MICFacultyApp');
  console.warn(`
⚠️  Project path contains spaces:
   ${root}

   Android error: JSBigFileString::fromPath - Could not open file

   npm start / android:usb now auto-use a junction at:
   ${link}

   Or move the project to e.g. C:\\dev\\MICFacultyApp
`);
}
