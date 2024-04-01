/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "workspaceId" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "workspaceId";
