import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Industry Standard: Hum Vite ko bata rahe hain ki React aur Tailwind dono plugins ko bundle karte waqt use karna hai.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})