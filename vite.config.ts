import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: para GitHub Pages o app é servido em /{repo}/.
// Defina VITE_BASE="/pnv-avaliacoes/" no build de produção (o workflow já pode passar).
// Em dev/local fica "/".
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
