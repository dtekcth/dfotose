import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		proxy: {
			'/v1': 'http://localhost:4000',
			'/auth': 'http://localhost:4000'
		}
	},
	plugins: [sveltekit()]
});
