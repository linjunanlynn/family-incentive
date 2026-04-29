-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '👤',
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "pinHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🧒',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "birthday" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "accountKind" TEXT NOT NULL,
    "memberId" TEXT,
    "childId" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '✨',
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Behavior" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Behavior_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "behaviorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_memberId_key" ON "UserAccount"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_childId_key" ON "UserAccount"("childId");

-- CreateIndex
CREATE INDEX "UserAccount_memberId_idx" ON "UserAccount"("memberId");

-- CreateIndex
CREATE INDEX "UserAccount_childId_idx" ON "UserAccount"("childId");

-- CreateIndex
CREATE INDEX "Category_childId_idx" ON "Category"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_childId_key_key" ON "Category"("childId", "key");

-- CreateIndex
CREATE INDEX "Behavior_categoryId_idx" ON "Behavior"("categoryId");

-- CreateIndex
CREATE INDEX "LogEntry_childId_date_idx" ON "LogEntry"("childId", "date");

-- CreateIndex
CREATE INDEX "LogEntry_behaviorId_idx" ON "LogEntry"("behaviorId");

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Behavior" ADD CONSTRAINT "Behavior_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_behaviorId_fkey" FOREIGN KEY ("behaviorId") REFERENCES "Behavior"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

