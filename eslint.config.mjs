import { combine } from '@antfu/eslint-config';
import { getReactConfig } from '@jeremy-hibiki/eslint-config/eslint';
import reactCompiler from 'eslint-plugin-react-compiler';

export default combine(
  getReactConfig({
    tsconfigPath: 'tsconfig.json',
    useUnocss: false,
  }),
  [
    {
      name: 'react-compiler',
      plugins: {
        'react-compiler': reactCompiler,
      },
      rules: {
        'react-compiler/react-compiler': 'error',
      },
    },
  ]
);
