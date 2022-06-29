import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

const isProdution = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    watch: {
      clearScreen: false,
      include: 'src/**',
      exclude: 'node_modules/**',
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        ...(!isProdution && { compilerOptions: { target: 'esnext' } }),
      }),
      isProdution &&
        terser({
          format: {
            comments: /^\s*([@#]__[A-Z]+__\s*$|@cc_on)/,
          },
        }),
      postcss({
        config: {
          path: './postcss.config.js',
        },
        extensions: ['.css'],
        minimize: isProdution,
        extract: 'index.css',
        inject: false,
      }),
    ],
    external: [
      'react',
      'react-dom',
      '@use-gesture/react',
      'fabric',
      'randomcolor',
      'react-draggable',
    ],
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
    // https://github.com/rollup/rollup/issues/1666#issuecomment-1163091988
    watch: false,
  },
];
