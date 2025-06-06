const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const e = require('express');
const { join , resolve} = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/auth-service'),
  },
  resolve:{
    alias:{
      "@packages": join(__dirname, '../../packages'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    })
  ],
};
