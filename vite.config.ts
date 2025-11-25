import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  assetsInclude: ['**/*.svg'],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        instrukcja: './instrukcja-gry.html',
        ciekawostki: './ciekawostki.html',
      },
    },
  },
})