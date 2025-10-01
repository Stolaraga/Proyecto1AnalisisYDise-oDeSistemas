// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Usa "mode" que Vite te pasa, así evitamos process.env
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production'
    ? '/Proyecto1AnalisisYDise-oDeSistemas/' 
    : '/',
}))
