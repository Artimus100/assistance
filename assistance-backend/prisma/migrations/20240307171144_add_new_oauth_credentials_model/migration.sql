/*
  Warnings:

  - You are about to drop the `oAuth2Credentials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oAuth2Credentials" DROP CONSTRAINT "oAuth2Credentials_hostId_fkey";

-- DropTable
DROP TABLE "oAuth2Credentials";

-- CreateTable
CREATE TABLE "oAuth2Credential" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "oAuth2Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oAuth2Credential_clientId_key" ON "oAuth2Credential"("clientId");

-- AddForeignKey
ALTER TABLE "oAuth2Credential" ADD CONSTRAINT "oAuth2Credential_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
