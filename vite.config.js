import { defineConfig } from 'vite';

export default defineConfig({
  base: '/snow-game/',
  optimizeDeps: {
    include: ['three']
  },
  build: {
    rollupOptions: {
      external: []
    }
  }
});
