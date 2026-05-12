import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // important for Yandex Games build (relative paths)
  build: {
    assetsInlineLimit: 0, // avoid base64 encoding
    chunkSizeWarningLimit: 2000,
  },
  server: {
    host: true,
  }
});
