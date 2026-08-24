import next from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      'next/core-web-vitals',
      prettier
    ],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
    },
    ignores: ['dist', '.next', 'node_modules'],
  },
];
