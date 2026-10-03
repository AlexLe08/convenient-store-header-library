import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { fileURLToPath, URL } from 'node:url'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root: fileURLToPath(new URL('.', import.meta.url)),
      globals: true,
      environment: 'jsdom',
      environmentOptions: {
        jsdom: { url: 'http://localhost' },
      },
      setupFiles: fileURLToPath(new URL('./src/test-setup.ts', import.meta.url)),
      css: true,
      server: {
        deps: {
          // Force this package through Vite's transform pipeline instead of
          // Node's ESM loader. Without this, its CSS import resolves via Node,
          // which doesn't know how to load .css files.
          inline: ['convenient-store-enterprise-ui-library'],
        },
      },
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
      },
    },
  })
)
