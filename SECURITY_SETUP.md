# 🔐 SECURITY & CODE QUALITY SETUP

Complete documentation for all security and code quality tools configured in this MERN project.

---

## 📋 TABLE OF CONTENTS

1. [ESLint](#1-eslint)
2. [Prettier](#2-prettier)
3. [Jest](#3-jest)
4. [npm Audit](#4-npm-audit)
5. [Husky](#5-husky)
6. [Lint-Staged](#6-lint-staged)
7. [Commitlint](#7-commitlint)
8. [GitHub Actions CI](#8-github-actions-ci)
9. [Git Workflow](#9-git-workflow)
10. [Quick Reference](#10-quick-reference)

---

## 1. ESLint

**What it is:** Static analysis tool that finds and fixes problems in JavaScript code.

**Why it matters:** Catches bugs, enforces coding standards, prevents common security mistakes like `eval()`, unsafe regex patterns, and missing error handling.

### Locations
```
frontend/eslint.config.js   ← React + JSX rules
backend/eslint.config.js    ← Node.js security rules
```

### Installation
```bash
# Frontend
cd frontend
npm install --save-dev eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals

# Backend
cd backend
npm install --save-dev eslint @eslint/js globals
```

### Configuration

**Frontend** (`frontend/eslint.config.js`):
```js
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
export default [
  { ignores: ['dist', 'coverage'] },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
];
```

**Backend** (`backend/eslint.config.js`):
```js
export default [{
  files: ['src/**/*.js'],
  rules: {
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-process-exit': 'error',
    'prefer-const': 'error',
  },
}];
```

### Run Commands
```bash
# Run lint check
cd frontend && npm run lint
cd backend  && npm run lint

# Auto-fix issues
cd frontend && npm run lint:fix
cd backend  && npm run lint:fix

# From root (both at once)
npm run lint
```

---

## 2. Prettier

**What it is:** Opinionated code formatter that enforces consistent style.

**Why it matters:** Eliminates style debates, makes code reviews faster, and keeps codebase consistent across developers.

### Locations
```
frontend/.prettierrc
backend/.prettierrc
```

### Installation
```bash
# Frontend
cd frontend && npm install --save-dev prettier

# Backend
cd backend && npm install --save-dev prettier
```

### Configuration (both frontend and backend)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Run Commands
```bash
# Format all files
cd frontend && npm run format
cd backend  && npm run format

# Check format without writing
cd frontend && npm run format:check
cd backend  && npm run format:check

# From root (both at once)
npm run format
```

---

## 3. Jest

**What it is:** JavaScript testing framework with built-in mocking, coverage, and assertions.

**Why it matters:** Automated tests catch regressions, verify business logic, and improve confidence when refactoring.

### Locations
```
frontend/jest.config.js
backend/jest.config.js
frontend/src/**/__tests__/*.{test,spec}.jsx
backend/src/**/__tests__/*.{test,spec}.js
```

### Installation
```bash
# Frontend
cd frontend
npm install --save-dev jest jest-environment-jsdom babel-jest \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Backend
cd backend
npm install --save-dev jest supertest
```

### Writing Tests

**Frontend example** (`src/pages/auth/__tests__/Login.test.jsx`):
```jsx
import { render, screen } from '@testing-library/react';
import Login from '../Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
```

**Backend example** (`src/controllers/__tests__/userController.test.js`):
```js
const request = require('supertest');
const app = require('../../app');

describe('POST /register', () => {
  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/register').send({});
    expect(res.status).toBe(400);
  });
});
```

### Run Commands
```bash
# Run all tests
cd frontend && npm test
cd backend  && npm test

# Watch mode (re-runs on file change)
cd frontend && npm run test:watch
cd backend  && npm run test:watch

# Coverage report
cd frontend && npm run test:coverage
cd backend  && npm run test:coverage
```

---

## 4. npm Audit

**What it is:** Built-in npm tool that checks dependencies for known security vulnerabilities.

**Why it matters:** Third-party packages can contain vulnerabilities. Regular auditing catches these before they become exploits.

### No installation needed — built into npm

### Run Commands
```bash
# Check for vulnerabilities
cd frontend && npm audit
cd backend  && npm audit

# Only show high/critical
cd frontend && npm audit --audit-level=high
cd backend  && npm audit --audit-level=high

# Auto-fix safe updates
cd frontend && npm audit fix
cd backend  && npm audit fix

# Force fix (may include breaking changes — review carefully)
cd frontend && npm audit fix --force
cd backend  && npm audit fix --force

# From root (both at once)
npm run audit
```

### Severity Levels
| Level    | Action Required          |
|----------|--------------------------|
| critical | Fix immediately          |
| high     | Fix before next release  |
| moderate | Fix within 30 days       |
| low      | Fix when convenient      |

---

## 5. Husky

**What it is:** Tool that runs scripts (hooks) automatically on Git events.

**Why it matters:** Prevents bad code from being committed or pushed by running lint/tests automatically before every commit.

### Location
```
.husky/pre-commit     ← Runs lint-staged before every git commit
.husky/commit-msg     ← Validates commit message format
```

### Installation
```bash
# From project root
npm install --save-dev husky
npx husky init
```

### Hooks Content

**`.husky/pre-commit`:**
```sh
npx lint-staged
```

**`.husky/commit-msg`:**
```sh
npx --no -- commitlint --edit "$1"
```

### How it works
```
You run: git commit -m "feat: add login page"
         ↓
Husky runs: npx lint-staged
         ↓
lint-staged runs: eslint --fix + prettier --write on staged files
         ↓
Husky runs: commitlint (checks message format)
         ↓
Commit succeeds ✅ or fails ❌ with error message
```

---

## 6. Lint-Staged

**What it is:** Runs linters only on files that are staged for commit (not the entire project).

**Why it matters:** Keeps pre-commit hooks fast — only processes files you're actually committing.

### Location
```
.lintstagedrc.json   ← Root level config
```

### Installation
```bash
# From project root
npm install --save-dev lint-staged
```

### Configuration (`.lintstagedrc.json`)
```json
{
  "frontend/src/**/*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "backend/src/**/*.js": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

### Run Manually
```bash
# Run lint-staged manually (same as what Husky triggers)
npx lint-staged
```

---

## 7. Commitlint

**What it is:** Lints Git commit messages to follow the Conventional Commits standard.

**Why it matters:** Consistent commit messages enable automatic changelog generation, semantic versioning, and easier project history navigation.

### Location
```
commitlint.config.js   ← Root level
```

### Installation
```bash
# From project root
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Configuration (`commitlint.config.js`)
```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'revert', 'build'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
```

### Conventional Commit Format
```
<type>(<scope>): <subject>

Examples:
  feat(auth): add google oauth login
  fix(attendance): correct checkout time calculation
  docs(readme): update setup instructions
  refactor(profile): extract image upload to service
  test(leave): add unit tests for leave controller
  chore(deps): update dependencies to latest versions
  ci(github): add security audit workflow
```

### Run Manually
```bash
# Test a commit message
echo "feat: add new feature" | npx commitlint
```

---

## 8. GitHub Actions CI

**What it is:** Automated pipeline that runs on every push/PR to validate code quality and security.

### Locations
```
.github/workflows/ci.yml         ← Runs on every push/PR
.github/workflows/security.yml   ← Runs every Monday + on-demand
```

### CI Pipeline (ci.yml)

```
On push/PR to main, develop
        ↓
┌─────────────────┐    ┌─────────────────┐
│    FRONTEND     │    │    BACKEND      │
├─────────────────┤    ├─────────────────┤
│ npm ci          │    │ npm ci          │
│ eslint          │    │ eslint          │
│ prettier check  │    │ prettier check  │
│ vite build      │    │ jest tests      │
│ jest tests      │    │ npm audit       │
│ npm audit       │    └─────────────────┘
└─────────────────┘
        ↓
  SECURITY JOB
  (runs after both pass)
  ↓ audit --audit-level=critical
  ↓ upload JSON reports as artifacts
```

### Manual Trigger
```
GitHub → Repository → Actions → Security Scheduled Audit → Run workflow
```

---

## 9. Git Workflow

### Branch Naming
```
main          ← Production code only
develop       ← Integration branch
feature/xyz   ← New features
fix/xyz       ← Bug fixes
hotfix/xyz    ← Emergency production fixes
```

### Commit Flow
```bash
# 1. Make your changes
git add frontend/src/pages/auth/Login.jsx

# 2. Commit (Husky will auto-run lint-staged + commitlint)
git commit -m "feat(auth): add phone otp login"

# 3. Push to your branch
git push origin feature/phone-otp

# 4. Open PR → CI runs automatically → Merge when green ✅
```

### Skip Hooks (Emergency Only)
```bash
# Skip pre-commit hook (use sparingly)
git commit --no-verify -m "emergency fix"
```

---

## 10. Quick Reference

### Daily Commands

| Task | Command |
|------|---------|
| Start frontend | `cd frontend && npm run dev` |
| Start backend | `cd backend && npm run dev` |
| Start both | `npm run dev` (from root) |
| Lint everything | `npm run lint` (from root) |
| Format everything | `npm run format` (from root) |
| Run frontend tests | `cd frontend && npm test` |
| Run backend tests | `cd backend && npm test` |
| Security audit | `npm run audit` (from root) |

### CI Status Badges (add to README.md)
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
![Security](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/security.yml/badge.svg)
```

### Troubleshooting

**Husky not running:**
```bash
# Re-initialize Husky
npx husky init
# Ensure .husky/pre-commit is executable (Mac/Linux)
chmod +x .husky/pre-commit
```

**Prettier and ESLint conflict:**
```bash
# Install eslint-config-prettier to disable ESLint style rules
npm install --save-dev eslint-config-prettier
# Add 'prettier' to extends in eslint.config.js
```

**Commitlint failing:**
```bash
# Check your commit message format
git log --oneline -5
# Must follow: type(scope): subject in lowercase
```

**npm audit has vulnerabilities:**
```bash
npm audit fix          # Safe fixes only
npm audit fix --force  # Breaking fixes (review changelog first)
```

---

> **Last Updated:** July 2026  
> **Project:** Employee Management System (MERN)
