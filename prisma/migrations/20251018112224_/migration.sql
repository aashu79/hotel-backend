/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `menu_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sortOrder` on the `menu_categories` table. All the data in the column will be lost.
  - The primary key for the `menu_item_reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `menu_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sortOrder` on the `menu_items` table. All the data in the column will be lost.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `restaurant_config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."menu_item_reviews" DROP CONSTRAINT "menu_item_reviews_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."menu_item_reviews" DROP CONSTRAINT "menu_item_reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."menu_items" DROP CONSTRAINT "menu_items_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "menu_categories" DROP CONSTRAINT "menu_categories_pkey",
DROP COLUMN "sortOrder",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "menu_categories_id_seq";

-- AlterTable
ALTER TABLE "menu_item_reviews" DROP CONSTRAINT "menu_item_reviews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "menuItemId" SET DATA TYPE TEXT,
ADD CONSTRAINT "menu_item_reviews_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "menu_item_reviews_id_seq";

-- AlterTable
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_pkey",
DROP COLUMN "sortOrder",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "menu_items_id_seq";

-- AlterTable
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "orderId" SET DATA TYPE TEXT,
ALTER COLUMN "menuItemId" SET DATA TYPE TEXT,
ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "order_items_id_seq";

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "orders_id_seq";

-- AlterTable
ALTER TABLE "restaurant_config" DROP CONSTRAINT "restaurant_config_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "restaurant_config_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "reviews_id_seq";

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_reviews" ADD CONSTRAINT "menu_item_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_reviews" ADD CONSTRAINT "menu_item_reviews_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
