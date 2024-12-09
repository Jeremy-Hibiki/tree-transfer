import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const ReactCompilerConfig = {
  target: '18',
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    dts({ include: ['src'] }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'TreeTransfer',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-compiler-runtime', 'antd', 'lodash-es'],
    },
    sourcemap: true,
    minify: false,
  },
});
