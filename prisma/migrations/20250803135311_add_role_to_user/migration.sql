-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RESTAURANT', 'CUSTOMER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';
