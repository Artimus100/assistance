/*
  Warnings:

  - Added the required column `status` to the `content` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "content" ADD COLUMN     "status" "VideoStatus" NOT NULL;
