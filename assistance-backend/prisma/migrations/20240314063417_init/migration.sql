/*
  Warnings:

  - You are about to drop the `Editor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_editorId_fkey";

-- DropTable
DROP TABLE "Editor";

-- CreateTable
CREATE TABLE "editor" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "editor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "editor_username_key" ON "editor"("username");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "editor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
