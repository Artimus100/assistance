/*
  Warnings:

  - You are about to drop the `oAuth2Credentials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oAuth2Credentials" DROP CONSTRAINT "oAuth2Credentials_hostId_fkey";

-- DropTable
DROP TABLE "oAuth2Credentials";

-- CreateTable
CREATE TABLE "oAuthCredentials" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "oAuthCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oAuthCredentials_clientId_key" ON "oAuthCredentials"("clientId");

-- AddForeignKey
ALTER TABLE "oAuthCredentials" ADD CONSTRAINT "oAuthCredentials_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
