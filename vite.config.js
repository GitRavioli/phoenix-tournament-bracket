import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Check if we're in maintenance mode using the environment variable
  const isMaintenanceMode = process.env.VITE_MAINTENANCE_MODE === 'true'

  // If we're in maintenance mode, clear the app entry and add the maintenance.html
  if (isMaintenanceMode) {
    return {
      plugins: [vue()],
      build: {
        rollupOptions: {
          input: '/public/maintenance.html',  // Serve the maintenance page directly
        },
      },
    }
  }

  return {
    plugins: [vue()],
  }
})
