const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { target, replacement } of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-onedrive-metro] Patched: ${filePath}`);
    return true;
  }
  return false;
}

// 1. Patch @expo/metro-file-map/build/index.js
const expoMetroFileMapPath = path.join('node_modules', '@expo', 'metro-file-map', 'build', 'index.js');
patchFile(expoMetroFileMapPath, [
  {
    target: "if (fileMetadata[_constants.default.SYMLINK] === 1) {\n            return _fs().promises.readlink(this.#pathUtils.normalToAbsolute(normalPath)).then((symlinkTarget)=>{\n                fileMetadata[_constants.default.VISITED] = 1;\n                fileMetadata[_constants.default.SYMLINK] = (0, _normalizePathSeparatorsToPosix.default)(this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget));\n            });\n        }",
    replacement: "if (fileMetadata[_constants.default.SYMLINK] === 1) {\n            return _fs().promises.readlink(this.#pathUtils.normalToAbsolute(normalPath)).then((symlinkTarget)=>{\n                fileMetadata[_constants.default.VISITED] = 1;\n                fileMetadata[_constants.default.SYMLINK] = (0, _normalizePathSeparatorsToPosix.default)(this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget));\n            }).catch((err) => {\n                if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN' || err.code === 'ENOENT')) {\n                    fileMetadata[_constants.default.SYMLINK] = 0;\n                    fileMetadata[_constants.default.VISITED] = 1;\n                    return;\n                }\n                throw err;\n            });\n        }",
  },
  {
    target: "            if ([\n                'ENOENT',\n                'EACCESS'\n            ].includes(error.code ?? '')) {",
    replacement: "            if ([\n                'ENOENT',\n                'EACCESS',\n                'EACCES',\n                'EINVAL'\n            ].includes(error.code ?? '')) {",
  },
]);

// 2. Patch metro-file-map/src/index.js
const metroFileMapPath = path.join('node_modules', 'metro-file-map', 'src', 'index.js');
patchFile(metroFileMapPath, [
  {
    target: "    if (fileMetadata[H.SYMLINK] === 1) {\n      return fs.promises\n        .readlink(this.#pathUtils.normalToAbsolute(normalPath))\n        .then((symlinkTarget) => {\n          fileMetadata[H.VISITED] = 1;\n          fileMetadata[H.SYMLINK] = normalizePathSeparatorsToPosix(\n            this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget),\n          );\n        });\n    }",
    replacement: "    if (fileMetadata[H.SYMLINK] === 1) {\n      return fs.promises\n        .readlink(this.#pathUtils.normalToAbsolute(normalPath))\n        .then((symlinkTarget) => {\n          fileMetadata[H.VISITED] = 1;\n          fileMetadata[H.SYMLINK] = normalizePathSeparatorsToPosix(\n            this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget),\n          );\n        }).catch((err) => {\n          if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN' || err.code === 'ENOENT')) {\n            fileMetadata[H.SYMLINK] = 0;\n            fileMetadata[H.VISITED] = 1;\n            return;\n          }\n          throw err;\n        });\n    }",
  },
  {
    target: '      if (["ENOENT", "EACCESS"].includes(error.code)) {',
    replacement: '      if (["ENOENT", "EACCESS", "EACCES", "EINVAL"].includes(error.code)) {',
  },
]);

console.log('[patch-onedrive-metro] Done!');
