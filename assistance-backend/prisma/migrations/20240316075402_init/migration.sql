/*
  Warnings:

  - You are about to drop the column `videoId` on the `Content` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Content_videoId_key";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "videoId";
