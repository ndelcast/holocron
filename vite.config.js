import { defineConfig } from 'vite';

// GitHub Pages sert le site sous /holocron/ ; en dev on reste à la racine
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/holocron/' : '/',
}));
