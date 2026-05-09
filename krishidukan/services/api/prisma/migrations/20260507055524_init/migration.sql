-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('pending_review', 'active', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('pesticide_license', 'fertilizer_license', 'seed_license', 'gst_registration', 'trade_license', 'fssai', 'other');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('seeds', 'fertilizers', 'pesticides', 'herbicides', 'fungicides', 'micronutrients', 'irrigation_equipment', 'farm_tools', 'animal_feed', 'veterinary_supplies', 'organic_inputs', 'plant_growth_regulators', 'other');

-- CreateEnum
CREATE TYPE "InventorySource" AS ENUM ('erp', 'manual');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('view', 'call', 'direction');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'cancelled', 'trialing');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'shop_owner', 'farmer');

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "gst" TEXT,
    "address_line" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "location" geometry(Point, 4326),
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "erp_api_key_hash" TEXT,
    "admin_notes" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'pending_review',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_licenses" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "license_type" "LicenseType" NOT NULL,
    "license_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "document_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" "ProductCategory" NOT NULL,
    "default_image" TEXT,
    "description" TEXT,
    "aliases" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_inventory" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "source" "InventorySource" NOT NULL DEFAULT 'manual',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_farmers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "name" TEXT,
    "location" geometry(Point, 4326),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "product_id" TEXT NOT NULL,
    "query_lat" DOUBLE PRECISION NOT NULL,
    "query_lng" DOUBLE PRECISION NOT NULL,
    "radius_km" DOUBLE PRECISION NOT NULL,
    "results_count" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_views" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT,
    "action" "ActionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'free',
    "amount" DECIMAL(10,2),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "razorpay_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_phone_key" ON "shops"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "shops_firebase_uid_key" ON "shops"("firebase_uid");

-- CreateIndex
CREATE INDEX "shops_status_idx" ON "shops"("status");

-- CreateIndex
CREATE INDEX "shop_licenses_shop_id_idx" ON "shop_licenses"("shop_id");

-- CreateIndex
CREATE INDEX "products_master_category_idx" ON "products_master"("category");

-- CreateIndex
CREATE INDEX "products_master_name_idx" ON "products_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_master_name_brand_key" ON "products_master"("name", "brand");

-- CreateIndex
CREATE INDEX "shop_inventory_product_id_in_stock_idx" ON "shop_inventory"("product_id", "in_stock");

-- CreateIndex
CREATE UNIQUE INDEX "shop_inventory_shop_id_product_id_key" ON "shop_inventory"("shop_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_farmers_phone_key" ON "users_farmers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_farmers_firebase_uid_key" ON "users_farmers"("firebase_uid");

-- CreateIndex
CREATE INDEX "search_logs_product_id_idx" ON "search_logs"("product_id");

-- CreateIndex
CREATE INDEX "search_logs_timestamp_idx" ON "search_logs"("timestamp");

-- CreateIndex
CREATE INDEX "shop_views_shop_id_timestamp_idx" ON "shop_views"("shop_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_shop_id_key" ON "subscriptions"("shop_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- AddForeignKey
ALTER TABLE "shop_licenses" ADD CONSTRAINT "shop_licenses_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_inventory" ADD CONSTRAINT "shop_inventory_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_inventory" ADD CONSTRAINT "shop_inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_views" ADD CONSTRAINT "shop_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_views" ADD CONSTRAINT "shop_views_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
