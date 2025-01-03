import react from '@vitejs/plugin-react';
import { globSync } from 'tinyglobby';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const srcFiles = globSync(['src/**/*.ts(x)?']);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              target: '19',
            },
          ],
        ],
      },
    }),
    dts({
      include: srcFiles,
      outDir: 'dist/types',
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: srcFiles,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
        generatedCode: 'es2015',
      },
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-compiler-runtime', 'antd', 'lodash.difference'],
    },
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    target: 'es2015',
  },
});
