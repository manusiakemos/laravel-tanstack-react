import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-table',
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'lucide-react',
  ],
  target: 'es2022',
})
