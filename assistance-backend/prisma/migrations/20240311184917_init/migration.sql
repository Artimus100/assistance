/*
  Warnings:

  - You are about to drop the `oAuth2Credential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oAuth2Credential" DROP CONSTRAINT "oAuth2Credential_hostId_fkey";

-- DropTable
DROP TABLE "oAuth2Credential";

-- CreateTable
CREATE TABLE "OAuth2Credential" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "OAuth2Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuth2Credential_clientId_key" ON "OAuth2Credential"("clientId");

-- AddForeignKey
ALTER TABLE "OAuth2Credential" ADD CONSTRAINT "OAuth2Credential_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
