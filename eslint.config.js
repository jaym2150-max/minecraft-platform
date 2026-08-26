import next from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    // Flat config has no cascade: a top-level `ignores` entry is global;
    // `ignores` inside other entries only scopes that entry.
    ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/coverage/**', '.turbo/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    // TypeScript must be parsed by @typescript-eslint/parser or ESLint chokes
    // on `interface`/type annotations ("Parsing error: unexpected token :").
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
    },
    // ESLint 9 flat config: no `extends` key — spread the prebuilt Next
    // core-web-vitals flat config object instead (`extends` is eslintrc-only
    // and made the old config throw, failing every pre-commit hook).
    ...next.flatConfig.coreWebVitals,
    rules: {
      ...next.flatConfig.coreWebVitals.rules,
      '@next/next/no-html-link-for-pages': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  prettier,
];
