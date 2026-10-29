import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  {
    ignores: ['node_modules/', 'coverage/'],
  },
];
