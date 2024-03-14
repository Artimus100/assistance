/*
  Warnings:

  - You are about to drop the `content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `editor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "content" DROP CONSTRAINT "content_editorId_fkey";

-- DropTable
DROP TABLE "content";

-- DropTable
DROP TABLE "editor";

-- CreateTable
CREATE TABLE "Editor" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "Editor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoFile" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "editorId" INTEGER NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Editor_username_key" ON "Editor"("username");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
