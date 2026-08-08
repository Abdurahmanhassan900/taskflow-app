import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '5173-iyby2qaw75vcfk2q3ckyb-9bd50b9d.us2.manus.computer',
      '.manus.computer',
    ],
  },
})
