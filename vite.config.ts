import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        instrukcja: "./instrukcja-gry.html",
        oprojekcie: "./o-projekcie.html",
        bajki: "./bajki-malych-melomanow.html",
      },
    },
  },
});
