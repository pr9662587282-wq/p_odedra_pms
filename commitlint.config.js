module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce conventional commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, no code change
        'refactor', // Refactoring, no feature or fix
        'perf',     // Performance improvement
        'test',     // Adding/updating tests
        'chore',    // Build process or tool changes
        'ci',       // CI/CD changes
        'revert',   // Reverting a previous commit
        'build',    // Build system changes
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};
