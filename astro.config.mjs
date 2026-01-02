import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // Genera HTML estático para Capacitor
  output: 'static',
  site: 'https://jesus1942.github.io/AquaTech',
  base: '/AquaTech',

  build: {
    outDir: 'dist', // Carpeta de salida estándar para Capacitor
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
