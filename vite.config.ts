import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tsConfigPaths from "vite-tsconfig-paths"

export default ({ mode }: { mode: string }) => {

  // Carga las variables de entorno del nivel de la aplicación a las variables de entorno del nivel del nodo.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [
      react(),
      tsConfigPaths(),
      electron({
        main: {
          entry: 'electron/main.ts',
        },
        preload: {
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        renderer: process.env.NODE_ENV === 'test'
          ? undefined
          : {},
      }),
    ],
  })
}
