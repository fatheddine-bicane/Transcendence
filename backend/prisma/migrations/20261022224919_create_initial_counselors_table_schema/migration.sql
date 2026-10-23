-- CreateTable
CREATE TABLE "counselors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "counselors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "counselors_user_id_key" ON "counselors"("user_id");

-- AddForeignKey
ALTER TABLE "counselors" ADD CONSTRAINT "counselors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
