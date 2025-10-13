import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': resolve(dirname(fileURLToPath(import.meta.url)), 'src'),
			'@components': resolve(dirname(fileURLToPath(import.meta.url)), 'src/components'),
			'@pages': resolve(dirname(fileURLToPath(import.meta.url)), 'src/pages'),
			'@api': resolve(dirname(fileURLToPath(import.meta.url)), 'src/api'),
		},
	},
})
