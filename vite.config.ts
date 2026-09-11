import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  server: { headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' } },
  preview: { headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react(), sites()],
});
