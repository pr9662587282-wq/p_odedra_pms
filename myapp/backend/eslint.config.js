import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'dist', 'coverage', 'uploads'] },

  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      sourceType: 'commonjs',
    },
    rules: {
      ...js.configs.recommended.rules,

      // Node.js best practices
      'no-process-exit': 'error',
      'no-sync': 'warn',

      // Code quality
      'no-console': ['warn', { allow: ['log', 'warn', 'error', 'info'] }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // Security
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Async/await
      'no-return-await': 'error',
      'prefer-promise-reject-errors': 'error',

      // Import hygiene
      'no-duplicate-imports': 'error',
    },
  },
];
