-- CreateTable
CREATE TABLE "content" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoFile" TEXT NOT NULL,
    "editorId" INTEGER NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "editor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
