-- AlterTable
ALTER TABLE "Post" ADD COLUMN "coverCaption" TEXT;
ALTER TABLE "Post" ADD COLUMN "hashtags" TEXT[] NOT NULL DEFAULT '{}';