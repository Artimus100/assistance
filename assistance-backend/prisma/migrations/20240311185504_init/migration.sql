/*
  Warnings:

  - You are about to drop the column `accessToken` on the `OAuth2Credential` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `OAuth2Credential` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OAuth2Credential" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken";
