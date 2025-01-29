import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js', // El punto de entrada de tu widget
  output: {
    file: 'dist/widget.js',
    format: 'iife', // IIFE para ejecución inmediata en el navegador
    name: 'MyWidget'
  },
  plugins: [resolve(), commonjs(), terser()]
};
