const path = require('path');
const fs = require('fs');

/**
 * Fix: On Windows with OneDrive, reparse points are flagged as isSymbolicLink === true
 * in libuv/Node Dirent, but fs.readlink fails with EINVAL because they are not actual symlinks.
 * This patch ensures Metro's crawler treats OneDrive reparse points as regular files.
 */
if (process.platform === 'win32') {
  const origIsSymbolicLink = fs.Dirent.prototype.isSymbolicLink;
  const origIsFile = fs.Dirent.prototype.isFile;

  fs.Dirent.prototype.isSymbolicLink = function() {
    const isLink = origIsSymbolicLink.call(this);
    if (!isLink) return false;
    const parent = this.parentPath || this.path || '';
    const fullPath = path.join(parent, this.name);
    try {
      fs.readlinkSync(fullPath);
      return true;
    } catch (err) {
      if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
        return false;
      }
      return isLink;
    }
  };

  fs.Dirent.prototype.isFile = function() {
    if (origIsFile.call(this)) return true;
    if (origIsSymbolicLink.call(this)) {
      const parent = this.parentPath || this.path || '';
      const fullPath = path.join(parent, this.name);
      try {
        fs.readlinkSync(fullPath);
        return false;
      } catch (err) {
        if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
          return true;
        }
      }
    }
    return false;
  };
}

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
