const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Android cannot mmap the JS bundle when Metro's project root path contains spaces
 * (JSBigFileString::fromPath - Could not open file).
 *
 * Prefer the dev junction from run-with-safe-path.mjs when present.
 */
function resolveMetroRoot() {
  const fromEnv = process.env.MIC_FACULTY_DEV_ROOT;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return path.resolve(fromEnv);
  }

  const here = __dirname;
  if (process.platform === 'win32' && /\s/.test(here)) {
    const junction = path.join(
      process.env.LOCALAPPDATA || path.join(require('os').homedir(), 'AppData', 'Local'),
      'dev',
      'MICFacultyApp',
    );
    if (fs.existsSync(junction)) {
      return path.resolve(junction);
    }
  }

  return here;
}

const projectRoot = resolveMetroRoot();
if (projectRoot !== __dirname && process.env.NODE_ENV !== 'test') {
  console.log(`[metro] Using path without spaces (fixes Android JSBigFileString):\n  ${projectRoot}\n`);
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

module.exports = config;
