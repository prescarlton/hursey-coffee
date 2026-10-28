-- Teachers can order too: they give a location (e.g. "Room 12") instead of
-- a parking space and car, so those columns become nullable.
ALTER TABLE "Order" ADD COLUMN "teacherLocation" TEXT;
ALTER TABLE "Order" ALTER COLUMN "carColor" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "carType" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "parkingSpace" DROP NOT NULL;
