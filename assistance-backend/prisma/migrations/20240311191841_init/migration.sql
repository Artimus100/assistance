/*
  Warnings:

  - You are about to drop the `OAuth2Credential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OAuth2Credential" DROP CONSTRAINT "OAuth2Credential_hostId_fkey";

-- DropTable
DROP TABLE "OAuth2Credential";

-- CreateTable
CREATE TABLE "oauth2credential" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "oauth2credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth2credential_clientId_key" ON "oauth2credential"("clientId");

-- AddForeignKey
ALTER TABLE "oauth2credential" ADD CONSTRAINT "oauth2credential_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
