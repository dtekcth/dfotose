import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      /* '/v1': 'http://localhost:3000',
      "/auth": "http://localhost:3000" */
      '/v1': 'https://dfoto.se',
      '/auth': 'https://dfoto.se',
    },
  },
  plugins: [
    react({
      babel: {
        configFile: true,
      },
    }),
  ],
});