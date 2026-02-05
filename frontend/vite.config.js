import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-well-known',
      closeBundle() {
        try {
          mkdirSync('dist/.well-known', { recursive: true });
          copyFileSync(
            'public/.well-known/farcaster.json',
            'dist/.well-known/farcaster.json'
          );
          console.log('✅ Copied .well-known/farcaster.json to dist');
        } catch (err) {
          console.error('Failed to copy .well-known:', err);
        }
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
