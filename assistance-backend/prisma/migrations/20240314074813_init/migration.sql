/*
  Warnings:

  - A unique constraint covering the columns `[videoId]` on the table `Content` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "videoId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_videoId_key" ON "Content"("videoId");
