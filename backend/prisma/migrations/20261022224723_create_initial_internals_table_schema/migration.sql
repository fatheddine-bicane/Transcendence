-- CreateTable
CREATE TABLE "internals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "internals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internals_user_id_key" ON "internals"("user_id");

-- AddForeignKey
ALTER TABLE "internals" ADD CONSTRAINT "internals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
