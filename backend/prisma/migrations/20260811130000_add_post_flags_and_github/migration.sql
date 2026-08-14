-- AlterTable
ALTER TABLE "Post" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN "commentsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");