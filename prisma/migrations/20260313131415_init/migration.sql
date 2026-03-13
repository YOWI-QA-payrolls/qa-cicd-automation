-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('draft', 'active', 'deprecated');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('draft', 'active', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('passed', 'failed', 'skipped', 'error');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('idle', 'queued', 'in_progress', 'success', 'failure', 'error');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'active',
    "tags" TEXT[],
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TestPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestPlanCase" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestPlanCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "triggeredBy" TEXT,
    "source" TEXT NOT NULL,
    "githubRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL,
    "notes" TEXT,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "framework" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLink" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "scriptPath" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "lastRunStatus" "ResultStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubWorkflow" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "lastTriggered" TIMESTAMP(3),
    "lastStatus" "WorkflowStatus" NOT NULL DEFAULT 'idle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GithubWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerLog" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "triggeredBy" TEXT,
    "githubRunId" TEXT,
    "status" "WorkflowStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TriggerLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TestPlanCase_planId_caseId_key" ON "TestPlanCase"("planId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationLink_caseId_key" ON "AutomationLink"("caseId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPlan" ADD CONSTRAINT "TestPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPlan" ADD CONSTRAINT "TestPlan_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPlanCase" ADD CONSTRAINT "TestPlanCase_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TestPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestPlanCase" ADD CONSTRAINT "TestPlanCase_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TestPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "TestRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLink" ADD CONSTRAINT "AutomationLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubWorkflow" ADD CONSTRAINT "GithubWorkflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerLog" ADD CONSTRAINT "TriggerLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "GithubWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerLog" ADD CONSTRAINT "TriggerLog_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
