import react from '@vitejs/plugin-react';
import { globSync } from 'tinyglobby';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const ReactCompilerConfig = {
  target: '18',
};

const srcFiles = globSync(['src/**/*.ts(x)?']);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    dts({ include: srcFiles }),
  ],
  build: {
    lib: {
      entry: srcFiles,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-compiler-runtime', 'antd', 'lodash-es'],
    },
    sourcemap: true,
    minify: false,
  },
});
