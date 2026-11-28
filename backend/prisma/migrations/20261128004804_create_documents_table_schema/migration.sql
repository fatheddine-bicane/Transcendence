-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('PROFESSIONAL_LICENCE', 'ID_CARD', 'BACKGROUND_CHECK', 'THERAPY_WORKSPACE');

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "document_type" "document_type" NOT NULL,
    "object_key" VARCHAR(1024) NOT NULL,
    "counselor_id" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "counselors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
