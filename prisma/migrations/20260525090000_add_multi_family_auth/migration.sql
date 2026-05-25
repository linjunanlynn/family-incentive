-- Add a tenant boundary around the existing single-family data.
CREATE TABLE "Family" (
  "id" TEXT NOT NULL,
  "nameZh" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Family" ("id", "nameZh", "nameEn", "createdAt", "updatedAt")
VALUES ('default-family', '默认家庭', 'Default Family', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "Member" ADD COLUMN "familyId" TEXT;
ALTER TABLE "Child" ADD COLUMN "familyId" TEXT;
ALTER TABLE "UserAccount" ADD COLUMN "familyId" TEXT;
ALTER TABLE "Reward" ADD COLUMN "familyId" TEXT;
ALTER TABLE "LogEntry" ADD COLUMN "familyId" TEXT;
ALTER TABLE "RewardRedemption" ADD COLUMN "familyId" TEXT;

UPDATE "Member" SET "familyId" = 'default-family' WHERE "familyId" IS NULL;
UPDATE "Child" SET "familyId" = 'default-family' WHERE "familyId" IS NULL;
UPDATE "Reward" SET "familyId" = 'default-family' WHERE "familyId" IS NULL;
UPDATE "LogEntry" SET "familyId" = 'default-family' WHERE "familyId" IS NULL;
UPDATE "RewardRedemption" SET "familyId" = 'default-family' WHERE "familyId" IS NULL;
UPDATE "UserAccount"
SET "familyId" = 'default-family'
WHERE "familyId" IS NULL AND "accountKind" <> 'super_admin';

UPDATE "UserAccount"
SET "accountKind" = 'family_admin'
WHERE "username" = 'mom' AND "accountKind" = 'parent_admin';

INSERT INTO "UserAccount" ("id", "username", "passwordHash", "accountKind", "disabled", "createdAt")
SELECT
  'super-admin',
  'superadmin',
  "passwordHash",
  'super_admin',
  false,
  CURRENT_TIMESTAMP
FROM "UserAccount"
WHERE "username" = 'mom'
ON CONFLICT ("username") DO UPDATE
SET "accountKind" = 'super_admin',
    "familyId" = NULL,
    "memberId" = NULL,
    "childId" = NULL,
    "disabled" = false;

ALTER TABLE "Member" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "Child" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "Reward" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "LogEntry" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "RewardRedemption" ALTER COLUMN "familyId" SET NOT NULL;

ALTER TABLE "Family" ADD CONSTRAINT "Family_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Member" ADD CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Child" ADD CONSTRAINT "Child_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Family_createdById_idx" ON "Family"("createdById");
CREATE INDEX "Member_familyId_idx" ON "Member"("familyId");
CREATE INDEX "Child_familyId_idx" ON "Child"("familyId");
CREATE INDEX "UserAccount_familyId_idx" ON "UserAccount"("familyId");
CREATE INDEX "Reward_familyId_idx" ON "Reward"("familyId");
CREATE INDEX "LogEntry_familyId_date_idx" ON "LogEntry"("familyId", "date");
CREATE INDEX "RewardRedemption_familyId_status_idx" ON "RewardRedemption"("familyId", "status");
