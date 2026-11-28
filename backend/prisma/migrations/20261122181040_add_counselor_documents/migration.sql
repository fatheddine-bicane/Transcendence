-- CreateEnum
CREATE TYPE "counselors_approved_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('CIN', 'CV', 'MEDICAL_CERTIFICATE');

-- AlterTable
ALTER TABLE "counselors" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "status" "counselors_approved_status" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "document_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counselor_documents" (
    "id" SERIAL NOT NULL,
    "counselor_id" INTEGER NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counselor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "counselor_documents_counselor_id_document_type_id_key" ON "counselor_documents"("counselor_id", "document_type_id");

-- AddForeignKey
ALTER TABLE "counselor_documents" ADD CONSTRAINT "counselor_documents_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "counselors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_documents" ADD CONSTRAINT "counselor_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
