/*
  Warnings:

  - Added the required column `wokspaceId` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "wokspaceId" INTEGER NOT NULL;
