-- CreateEnum
CREATE TYPE "refresh_token_status" AS ENUM ('ACTIVE', 'USED', 'REVOKED');

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "jti" UUID NOT NULL,
    "family" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "refresh_token_status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("jti")
);
