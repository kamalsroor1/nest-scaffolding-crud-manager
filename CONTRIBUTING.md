# Contributing to NestJS Scaffolding CRUD Manager

Thank you for considering contributing! 🎉  
Every contribution — bug fix, feature, doc improvement — is welcome.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/kamalsroor1/nest-scaffolding-crud-manager.git
   cd nest-scaffolding-crud-manager
   ```
3. Add the **upstream** remote:
   ```bash
   git remote add upstream https://github.com/kamalsroor1/nest-scaffolding-crud-manager.git
   ```

---

## Development Setup

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
docker-compose up -d db redis
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Run Tests

```bash
cd backend
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
npm run test:cov      # coverage report
```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/add-google-oauth` |
| Bug fix | `fix/short-description` | `fix/refresh-token-expiry` |
| Docs | `docs/short-description` | `docs/update-generator-readme` |
| Refactor | `refactor/short-description` | `refactor/auth-service` |
| Chore | `chore/short-description` | `chore/update-dependencies` |

```bash
git checkout -b feature/your-feature-name
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(scope): short description

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies |
| `perf` | Performance improvement |

### Examples

```bash
feat(auth): add Google OAuth login
fix(generator): resolve module auto-registration bug
docs(readme): add generator usage examples
test(users): add integration tests for CRUD endpoints
chore(deps): upgrade NestJS to v11
```

---

## Pull Request Process

1. **Sync** with upstream before starting:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes** on your feature branch

3. **Run tests** and make sure they pass:
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

4. **Push** your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** against `main` with:
   - A clear title following the commit convention
   - Description of what changed and why
   - Screenshots if it's a UI change
   - Reference any related issue: `Closes #123`

6. Wait for review — maintainer will respond within a few days

### PR Checklist

- [ ] Tests pass locally
- [ ] New code has tests
- [ ] No lint errors (`npm run lint`)
- [ ] `.env.example` updated if new env vars added
- [ ] `CHANGELOG.md` entry added under `[Unreleased]`
- [ ] Swagger docs updated if API changed

---

## Code Style

- **ESLint + Prettier** — run `npm run lint` before committing
- **No `any` types** — use proper TypeScript types
- **DTOs for every endpoint** — no raw `@Body() body: any`
- **Services, not Controllers** — business logic goes in services
- **One module per feature** — follow the existing structure
- **Tests alongside code** — `users.service.spec.ts` next to `users.service.ts`

---

## Reporting Bugs

Open a GitHub Issue with:

- **Clear title** describing the bug
- **Steps to reproduce** (numbered list)
- **Expected behavior**
- **Actual behavior**
- **Environment** (OS, Node version, NestJS version)
- **Error logs** if available

---

## Suggesting Features

Open a GitHub Issue with the `enhancement` label and describe:

- **The problem** you're trying to solve
- **Your proposed solution**
- **Alternatives you considered**

---

## Questions?

Open a [GitHub Discussion](https://github.com/kamalsroor1/nest-scaffolding-crud-manager/discussions) — don't use Issues for questions.

---

Thank you for contributing! 🙏
