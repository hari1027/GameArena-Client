import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
      // The compiler is currently added via the babel option
      // even when using the SWC plugin in some configurations
    }),
  ],
})
