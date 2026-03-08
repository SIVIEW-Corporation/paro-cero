# Codebase Guide for Agents

This document provides instructions and guidelines for agents operating in this repository.

## 1. Build, Lint, and Test Commands

### Build

- **Production Build**: `npm run build`
  - Runs linting first, then builds the Next.js application.
- **Local Build**: `npm run build:local`
  - Runs format check first, then builds.

### Linting and Formatting

- **Lint**: `npm run lint` (`eslint .`)
- **Lint Fix**: `npm run lint:fix`
- **Check Format**: `npm run format:check` (`prettier --check .`)
- **Fix Format**: `npm run format:fix` (`prettier --write .`)

### Testing

- **Verify Changes**: Since there are no automated tests, verify changes by building the project (`npm run build:local`) and ensuring no lint/type errors occur.

## 2. Skill Usage

Use these skills for detailed patterns on-demand.

### Project Skills

| Skill | Description | URL |
|-------|-------------|-----|
| `nextjs-v16` | App Router, Server Actions, Caching | [SKILL.md](skills/nextjs-v16/SKILL.md) |
| `commits` | Professional conventional commits | [SKILL.md](skills/commits/SKILL.md) |
| `typescript` | Const types, flat interfaces, utility types | [SKILL.md](skills/typescript/SKILL.md) |
| `react-19` | No useMemo/useCallback, React Compiler | [SKILL.md](skills/react-19/SKILL.md) |
| `tailwind-4` | cn() utility, no var() in className | [SKILL.md](skills/tailwind-4/SKILL.md) |
| `zod-4` | New API (z.email(), z.uuid()) | [SKILL.md](skills/zod-4/SKILL.md) |
| `zustand-5` | Persist, selectors, slices | [SKILL.md](skills/zustand-5/SKILL.md) |
| `motion-dev` | Animations (Motion v12), gestures, transitions | [SKILL.md](skills/motion-dev/SKILL.md) |
| `react-dropzone` | Drag-and-drop file uploads | [SKILL.md](skills/react-dropzone/SKILL.md) |
| `skill-creator` | Create new AI agent skills | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Sync skill metadata to AGENTS.md | [SKILL.md](skills/skill-sync/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| App Router / Server Actions | `nextjs-v16` |
| Committing changes | `commits` |
| Creating Zod schemas | `zod-4` |
| Creating a git commit | `commits` |
| Creating new skills | `skill-creator` |
| Creating/modifying components | `react-19` |
| Adding animations/transitions | `motion-dev` |
| Implementing file uploads with react-dropzone | `react-dropzone` |
| Using "use cache" directive | `nextjs-v16` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Writing React 19 hooks/components | `react-19` |
| Writing TypeScript types | `typescript` |
| Syncing skill metadata | `skill-sync` |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke | `skill-sync` |

## 3. Commit Conventions

Follow conventional-commit style: `<type>(<scope>): <description>`

- **Types**: `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`
- **Scope**: Lowercase, e.g., `api`, `ui`, `auth` (optional but recommended)
- **Description**: Concise, lowercase, no period at end.

**Critical Rules**:

1. ALWAYS use the `commits` skill to generate messages.
2. NEVER commit automatically. The agent must ALWAYS ask the user for permission in the next step before executing the commit command.
3. Keep the first line under 72 characters.

## 4. Code Style & Conventions

### Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (Strict mode)
- **UI/Styling**: Tailwind CSS v4, Lucide React (Icons)
- **State Management**: Zustand
- **Data Fetching/Forms**: TanStack Query, TanStack Table, TanStack Form
- **Validation**: Zod
- **Notifications**: Sonner

### Formatting Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'`) for strings and imports.
- **Semicolons**: Always use semicolons.
- **Trailing Commas**: Yes, in multi-line objects/arrays.

### Naming Conventions

- **Files**:
  - Components/Pages: `kebab-case` or `PascalCase` (Next.js App Router uses specific file names like `page.tsx`, `layout.tsx`).
  - Utilities/Hooks: `camelCase` (e.g., `useFileUpload.ts`, `makeData.ts`).
- **Components**: `PascalCase` (e.g., `Anexo30Page`, `HistoryTable`).
- **Functions/Variables**: `camelCase`.
- **Types/Interfaces**: `PascalCase`.
- **Server Actions**: Suffix with `Action` (e.g., `getDocumentsAction`).

### Imports

- **Path Alias**: Use `@/` for absolute imports from `src/` (e.g., `@/components/...`, `@/lib/...`).
- **Ordering**:
  1. Built-in Node/React imports (`react`, `next/...`).
  2. Third-party libraries (`lucide-react`, `zod`).
  3. Internal components and hooks (`@/components/...`, `@/hooks/...`).
  4. Internal utilities/types (`@/utils/...`, `@/types/...`).

### Component Structure

- Use functional components with `export default function`.
- explicit types for props are encouraged.
- Place `'use client'` directive at the very top for client-side components.
- Use explicit types for event handlers (e.g., `e: React.MouseEvent<HTMLButtonElement>`).

### Server Actions

- Files containing server actions must start with `'use server'`.
- **Wrapper**: Use `protectedAction` from `@/lib/safe-action` for authenticated/safe actions.
- **Validation**: Define Zod schemas for input validation.

### State Management

- Use **Zustand** for global client state (e.g., `useAuthStore`).
- Use **React Query** (`@tanstack/react-query`) for server state/data fetching.

### Error Handling

- Server Actions should return structured responses or throw errors handled by the `protectedAction` wrapper.
- Client-side errors should be displayed using `sonner` toasts (e.g., `toast.error('Message')`).

### Type Safety

- Avoid `any`. Use specific types or generic constraints.
- Infer types from Zod schemas where possible (e.g., `z.infer<typeof Schema>`).

## 5. Cursor/Copilot Rules

_No specific `.cursorrules` or `.github/copilot-instructions.md` found in the repository._
