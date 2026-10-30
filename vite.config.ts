
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function fixPublicAssetUrls(): Plugin {
  let base = '/';

  return {
    name: 'fix-public-asset-urls',
    enforce: 'pre',

    configResolved(config) {
      base = config.base;
    },

    transform(code, id) {
      const file = id.split('?')[0].replaceAll('\\', '/');

      if (!file.includes('/src/')) return null;
      if (!/\.[cm]?[jt]sx?$/.test(file)) return null;
      if (base === '/' || !code.includes('/assets/')) {
        return null;
      }

      const updated = code.replace(
        /(['"`])\/assets\//g,
        (_, quote) => `${quote}${base}assets/`
      );

      return updated === code
        ? null
        : { code: updated, map: null };
    },
  };
}

export default defineConfig({
  plugins: [fixPublicAssetUrls(), react()],

  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
