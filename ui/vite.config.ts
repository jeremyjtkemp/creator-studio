import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Simple configuration - use environment variables or defaults
const config = {
  port: 3000,
  apiUrl: process.env.VITE_API_URL || 'http://localhost:8787', // Fixed to use correct port
  firebaseAuthPort: '5503',
  useFirebaseEmulator: 'false'
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: config.port
  },
  define: {
    'import.meta.env.VITE_API_URL': `"${config.apiUrl}"`,
    'import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT': `"${config.firebaseAuthPort}"`,
    'import.meta.env.VITE_USE_FIREBASE_EMULATOR': `"${config.useFirebaseEmulator}"`
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
