# QA Webapp — Claude Rules

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (PostgreSQL), Prisma ORM, Zustand
- Octokit.js (GitHub API), Vitest (unit tests), Playwright (E2E)
- Vercel (hosting), GitHub Actions (CI/CD)

## Path Aliases
- @/components → src/components
- @/hooks → src/hooks
- @/store → src/store
- @/lib → src/lib
- @/types → src/types

## Hard Rules — Never Break These
- GITHUB_PAT and SUPABASE_SERVICE_ROLE_KEY → server-side only, never in 'use client' files
- All DB queries → Prisma only, never raw SQL or $queryRaw
- No custom CSS → Tailwind utilities only, no inline styles, no CSS modules
- Never instantiate PrismaClient directly → always use singleton from @/lib/prisma
- Run `npm run lint` before every commit
- After any schema change → npx prisma migrate dev → npx prisma generate
- GitHub client (@/lib/github/client) → server-side only, never in 'use client' files

## React / Next.js Rules
- All components are Server Components by default
- Add 'use client' ONLY when using: useState, useEffect, Zustand stores, or event handlers
- Props must always have a TypeScript interface defined above the component
- Supabase browser client → Client Components only
- Supabase server client → Server Components and API routes only
- Use NextResponse.json() for all API route responses
- Always return typed error objects from API routes: { error: string, code: string }

## Zustand Stores
- triggerStore → activeRunId, runStatus, setRunStatus(), setActiveRun(), clearRun()
- uiStore → notifications[], addNotification(), removeNotification()
- projectStore → currentProject, projects[], setCurrentProject()
- authStore → user, isLoggedIn, setUser(), clearUser()
- Import from: @/store/[storeName]

## Prisma / DB Rules
- Never edit migration files manually
- All models: id String @id @default(uuid()), createdAt DateTime @default(now())
- User.id must match Supabase Auth UUID exactly
- Soft deletes only → add deletedAt DateTime? before removing any model
- Model relationships:
  - TestResult → TestRun → TestPlan → Project
  - TriggerLog → GithubWorkflow → Project
  - TestPlanCase joins TestPlan and TestCase

## StatusBadge Status Values
'idle' | 'queued' | 'in_progress' | 'success' | 'failure' | 'error'

## Error Codes
AUTH_ERROR | NOT_FOUND | NETWORK_ERROR | BAD_PAYLOAD | DUPLICATE

## Commands
- npm run dev → localhost:3000
- npm run lint → run before every commit
- npm run test → Vitest unit tests
- npm run format → Prettier
- npx prisma studio → localhost:5555
- npx prisma migrate dev → apply schema changes
- npx prisma generate → regenerate client
- npx prisma db seed → insert sample data