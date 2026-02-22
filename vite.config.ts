import { defineConfig } from 'vite';

export default defineConfig({
  base: '/starfox-reborn/',
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    outDir: 'docs',
  },
});
