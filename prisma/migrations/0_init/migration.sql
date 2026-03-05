-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."DeliverableStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."DeliverableType" AS ENUM ('LONG_LEAD', 'PICKLIST', 'PROD_RELEASE', 'SYS_DESIGN_CUSTOMER', 'CLASS_SUBMIT', 'FAT', 'MANUAL', 'SHIPPING');

-- CreateEnum
CREATE TYPE "public"."MilestoneStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MilestoneType" AS ENUM ('KICK_OFF', 'PDR', 'FDR');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- CreateTable
CREATE TABLE "public"."Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "public"."MilestoneType" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "public"."MilestoneStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "projectNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "shipType" TEXT NOT NULL,
    "classSociety" TEXT NOT NULL,
    "projectManagerName" TEXT NOT NULL,
    "plannedDeliveryDate" TIMESTAMP(3),
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "description" TEXT,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectDeliverable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "public"."DeliverableType" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "public"."DeliverableStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReminderLog" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT,
    "projectDeliverableId" TEXT,
    "reminderWindow" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3),
    "estimatedHours" DECIMAL(6,2),
    "specJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "allocatedHours" DECIMAL(6,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityHoursPerWeek" DECIMAL(5,2) NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_projectId_type_key" ON "public"."Milestone"("projectId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNumber_key" ON "public"."Project"("projectNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDeliverable_projectId_type_key" ON "public"."ProjectDeliverable"("projectId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_milestoneId_reminderWindow_channel_key" ON "public"."ReminderLog"("milestoneId" ASC, "reminderWindow" ASC, "channel" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_projectDeliverableId_reminderWindow_channel_key" ON "public"."ReminderLog"("projectDeliverableId" ASC, "reminderWindow" ASC, "channel" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_teamMemberId_key" ON "public"."TaskAssignment"("taskId" ASC, "teamMemberId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectDeliverable" ADD CONSTRAINT "ProjectDeliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReminderLog" ADD CONSTRAINT "ReminderLog_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReminderLog" ADD CONSTRAINT "ReminderLog_projectDeliverableId_fkey" FOREIGN KEY ("projectDeliverableId") REFERENCES "public"."ProjectDeliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskAssignment" ADD CONSTRAINT "TaskAssignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "public"."TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
