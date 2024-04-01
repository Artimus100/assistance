/*
  Warnings:

  - You are about to drop the column `name` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `wokspaceId` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "name",
DROP COLUMN "wokspaceId";
