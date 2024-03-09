-- CreateTable
CREATE TABLE "editor" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "editor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "host_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "editor_username_key" ON "editor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "host_username_key" ON "host"("username");
