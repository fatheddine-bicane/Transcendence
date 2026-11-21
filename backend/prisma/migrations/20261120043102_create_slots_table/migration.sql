-- CreateEnum
CREATE TYPE "slot_state" AS ENUM ('CANCELED', 'BOOKED', 'LIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "slots" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "slot_state" "slot_state" NOT NULL DEFAULT 'LIVE',
    "counselor_id" INTEGER NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "counselors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
