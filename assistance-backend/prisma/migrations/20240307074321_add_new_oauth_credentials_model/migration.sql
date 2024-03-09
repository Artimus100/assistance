/*
  Warnings:

  - You are about to drop the `oAuthCredentials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oAuthCredentials" DROP CONSTRAINT "oAuthCredentials_hostId_fkey";

-- DropTable
DROP TABLE "oAuthCredentials";

-- CreateTable
CREATE TABLE "oAuth2Credentials" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "oAuth2Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oAuth2Credentials_clientId_key" ON "oAuth2Credentials"("clientId");

-- AddForeignKey
ALTER TABLE "oAuth2Credentials" ADD CONSTRAINT "oAuth2Credentials_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
