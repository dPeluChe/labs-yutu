import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['background/**', 'content/**', 'popup/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions, chrome: 'readonly' } }
  },
  {
    files: ['scripts/**', 'test/**', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node, document: 'readonly', chrome: 'readonly' } }
  },
  { rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] } }
];
