# QA Webapp — Claude Rules

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (PostgreSQL), Prisma ORM, Zustand
- Octokit.js (GitHub API), Vitest (unit tests), Playwright (E2E)

## Path Aliases
- @/components → src/components
- @/hooks → src/hooks
- @/store → src/store
- @/lib → src/lib
- @/types → src/types

## Hard Rules — Never Break These
- GITHUB_PAT and SUPABASE_SERVICE_ROLE_KEY → server-side only, never in any 'use client' file
- All DB queries → Prisma only, never raw SQL or $queryRaw
- No custom CSS → Tailwind utilities only, no inline styles, no CSS modules
- Never instantiate PrismaClient directly → always use singleton from @/lib/prisma
- Run `npm run lint` before every commit
- After any schema change → run npx prisma migrate dev then npx prisma generate

## React / Next.js Rules
- All components are Server Components by default
- Add 'use client' ONLY when using: useState, useEffect, Zustand stores, or event handlers
- Props must always have a TypeScript interface defined above the component
- GitHub client (@/lib/github/client) is server-side only → never import in 'use client' files
- Supabase browser client → Client Components only
- Supabase server client → Server Components and API routes only

## API Route Rules
- Verify Supabase session on every route before doing anything
- Use NextResponse.json() for all responses
- Always return typed error objects: { error: string, code: string }
- /api/results must verify x-webhook-secret header matches SUPABASE_WEBHOOK_SECRET

## Zustand Stores
- triggerStore → activeRunId, runStatus, setRunStatus(), setActiveRun(), clearRun()
- uiStore → notifications[], addNotification(), removeNotification()
- projectStore → currentProject, projects[], setCurrentProject()
- authStore → user, isLoggedIn, setUser(), clearUser()
- Import from: @/store/[storeName]

## Prisma / DB Rules
- Never edit migration files manually
- All models need: id String @id @default(cuid()), createdAt DateTime @default(now())
- Soft deletes only → add deletedAt DateTime? before removing any model
- Model relationships: TestResult → TestRun → TestPlan → Project
- TriggerLog → GithubWorkflow → Project
- TestPlanCase joins TestPlan and TestCase

## Error Codes to Use
AUTH_ERROR | NOT_FOUND | NETWORK_ERROR | BAD_PAYLOAD | DUPLICATE

## StatusBadge Status Values
'idle' | 'queued' | 'in_progress' | 'success' | 'failure' | 'error'

## Commands
- npm run dev → start dev server at localhost:3000
- npm run lint → ESLint check — run before every commit
- npm run test → Vitest unit tests
- npm run format → Prettier format all files
- npx prisma studio → inspect DB at localhost:5555
- npx prisma migrate dev → apply schema changes
- npx prisma generate → regenerate Prisma client after schema change
- npx prisma db seed → insert sample data
