import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        instrukcja: "./instrukcja-gry.html",
        ciekawostki: "./ciekawostki.html",
        oprojekcie: "./o-projekcie.html",
      },
    },
  },
});
