import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/kronologi/',  // GitHub Pages project path
    publicDir: 'public',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
})
