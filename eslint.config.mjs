// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/**
 * Shared base ESLint config for all workspaces.
 * Each workspace extends this and adds framework-specific rules.
 * TypeScript rules are added per-workspace to avoid plugin conflicts.
 */
export const baseConfig = [
  eslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  eslintConfigPrettier,
];
