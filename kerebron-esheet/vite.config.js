import { defineConfig } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// '@kerebron/wasm' exports only an "import" condition, so neither
// require.resolve nor package.json subpath resolution work. Walk up from
// this config file to the nearest node_modules holding the package.
function findWasmAssetsDir() {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const candidate = join(dir, 'node_modules', '@kerebron/wasm/assets');
    if (existsSync(candidate)) return resolve(candidate);
    const parent = dirname(dir);
    if (parent === dir) throw new Error('Cannot locate @kerebron/wasm/assets');
    dir = parent;
  }
}
const wasmAssetsDir = findWasmAssetsDir();

const MIME = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

function serveWasmAssets() {
  return {
    name: 'serve-wasm-assets',
    configureServer(server) {
      // connect strips the '/wasm' prefix, req.url is the remainder
      server.middlewares.use('/wasm', (req, res, next) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]);
        const file = resolve(wasmAssetsDir, '.' + rel);
        if (!file.startsWith(wasmAssetsDir + sep)) return next();
        let stats;
        try {
          stats = statSync(file);
        } catch {
          return next();
        }
        if (!stats.isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [serveWasmAssets()],
  optimizeDeps: {},
});
