/*
  Warnings:

  - You are about to drop the column `isBusy` on the `restaurant_config` table. All the data in the column will be lost.
  - You are about to drop the column `isOpen` on the `restaurant_config` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('OPEN', 'CLOSED', 'BUSY', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "restaurant_config" DROP COLUMN "isBusy",
DROP COLUMN "isOpen",
ADD COLUMN     "bannerImageUrl" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "heroText" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "locationUrl" TEXT,
ADD COLUMN     "status" "RestaurantStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "twitterUrl" TEXT;

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postalCode" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openingHours" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_services" ADD CONSTRAINT "delivery_services_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
