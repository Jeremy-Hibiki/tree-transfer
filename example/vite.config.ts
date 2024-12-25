import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    UnoCSS(),
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
  ],
  resolve: {
    alias: {
      '@jeremy-hibiki/tree-transfer': resolve(__dirname, '../tree-transfer/src'),
    },
  },
});
