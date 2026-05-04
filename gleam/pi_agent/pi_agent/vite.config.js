import { defineConfig } from 'vite';
import gleam from '@chouquette/vite/gleam';

export default defineConfig({
  plugins: [
    gleam(),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/pi_agent.gleam',
      name: 'PiAgent',
      fileName: 'pi-agent',
    },
  },
  server: {
    port: 3000,
  },
});
