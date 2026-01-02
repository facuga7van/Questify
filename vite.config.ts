import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tsConfigPaths from "vite-tsconfig-paths"
import dotenv from 'dotenv'

export default ({ mode }: { mode: string }) => {

  // Soporta tanto el formato estándar de Vite (.env*) como tus archivos legacy (env.local / env.production).
  // Orden: base -> local -> modo -> modo.local (lo último pisa a lo anterior).
  const envCandidates = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`,
    'env.local',
    `env.${mode}`,
    `env.${mode}.local`,
  ];

  for (const filename of envCandidates) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath, override: true });
    }
  }

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
