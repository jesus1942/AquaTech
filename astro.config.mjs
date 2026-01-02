import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // Genera HTML estático para Capacitor
  output: 'static',

  build: {
    outDir: 'dist', // Carpeta de salida estándar para Capacitor
  },

  vite: {
    plugins: [tailwindcss()]
  }
});