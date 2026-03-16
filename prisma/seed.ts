import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // User
  const user = await prisma.user.create({
    data: {
      email: 'admin@qa-app.dev',
      name: 'Admin User',
    },
  })

  // Project
  const project = await prisma.project.create({
    data: {
      name: 'Demo QA Project',
      description: 'Sample project seeded for local development',
      ownerId: user.id,
    },
  })

  // 3 Test Cases
  const case1 = await prisma.testCase.create({
    data: {
      projectId: project.id,
      title: 'User login with valid credentials',
      steps:
        '1. Navigate to /login\n2. Enter valid email and password\n3. Click Login',
      expected: 'User is redirected to the dashboard',
      tags: ['auth', 'smoke'],
      priority: 'high',
      createdBy: user.id,
    },
  })

  const case2 = await prisma.testCase.create({
    data: {
      projectId: project.id,
      title: 'User login with invalid password',
      steps:
        '1. Navigate to /login\n2. Enter valid email and wrong password\n3. Click Login',
      expected: 'Error message is shown beneath the password field',
      tags: ['auth', 'negative'],
      priority: 'medium',
      createdBy: user.id,
    },
  })

  const case3 = await prisma.testCase.create({
    data: {
      projectId: project.id,
      title: 'User profile display name update',
      steps:
        '1. Navigate to /settings/profile\n2. Change display name\n3. Click Save',
      expected: 'New display name appears in the header',
      tags: ['profile'],
      priority: 'low',
      createdBy: user.id,
    },
  })

  // Test Plan (with nested plan cases)
  const plan = await prisma.testPlan.create({
    data: {
      projectId: project.id,
      name: 'Sprint 1 Regression',
      version: '1.0',
      assignedTo: user.id,
      dueDate: new Date('2026-03-31'),
      status: 'active',
      planCases: {
        create: [
          { caseId: case1.id, orderIndex: 0 },
          { caseId: case2.id, orderIndex: 1 },
          { caseId: case3.id, orderIndex: 2 },
        ],
      },
    },
  })

  // Test Run
  const run = await prisma.testRun.create({
    data: {
      planId: plan.id,
      triggeredBy: user.id,
      source: 'manual',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  })

  // 3 Test Results: passed, failed, skipped
  await prisma.testResult.createMany({
    data: [
      {
        runId: run.id,
        caseId: case1.id,
        status: 'passed',
        durationMs: 1240,
        framework: 'playwright',
        retryCount: 0,
      },
      {
        runId: run.id,
        caseId: case2.id,
        status: 'failed',
        durationMs: 850,
        errorMessage: 'Expected error message element not found in DOM',
        framework: 'playwright',
        retryCount: 1,
      },
      {
        runId: run.id,
        caseId: case3.id,
        status: 'skipped',
        notes: 'Skipped — pending feature flag "profile-v2"',
        retryCount: 0,
      },
    ],
  })

  // GitHub Workflow
  await prisma.githubWorkflow.create({
    data: {
      projectId: project.id,
      repo: 'org/qa-cicd-automation',
      workflowId: 'ci.yml',
      workflowName: 'CI Pipeline',
      lastStatus: 'success',
      lastTriggered: new Date(),
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
