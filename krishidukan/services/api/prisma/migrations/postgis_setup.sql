-- Run this AFTER `prisma migrate dev --name init` creates the tables.
-- Apply with: psql $DATABASE_URL -f prisma/migrations/postgis_setup.sql

-- Enable PostGIS (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis;

-- GIST spatial indexes for fast radius queries
CREATE INDEX IF NOT EXISTS shops_location_gist
  ON shops USING GIST (location);

CREATE INDEX IF NOT EXISTS farmers_location_gist
  ON users_farmers USING GIST (location);

-- Trigger: auto-populate geometry from lat/lng on shops
CREATE OR REPLACE FUNCTION sync_shop_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shop_location ON shops;
CREATE TRIGGER trg_sync_shop_location
  BEFORE INSERT OR UPDATE OF lat, lng ON shops
  FOR EACH ROW EXECUTE FUNCTION sync_shop_location();

-- Trigger: auto-populate geometry from lat/lng on users_farmers
CREATE OR REPLACE FUNCTION sync_farmer_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_farmer_location ON users_farmers;
CREATE TRIGGER trg_sync_farmer_location
  BEFORE INSERT OR UPDATE OF lat, lng ON users_farmers
  FOR EACH ROW EXECUTE FUNCTION sync_farmer_location();
