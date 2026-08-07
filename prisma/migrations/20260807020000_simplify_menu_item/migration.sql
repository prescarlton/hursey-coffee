-- Menu items now only need a name + price. Drop the unused columns.
ALTER TABLE "MenuItem" DROP COLUMN "description";
ALTER TABLE "MenuItem" DROP COLUMN "category";
ALTER TABLE "MenuItem" DROP COLUMN "isAvailable";

-- Allow deleting a menu item that has past orders: null the reference instead
-- of blocking (order history is preserved via nameSnapshot / unitPriceCents).
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "menuItemId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey"
  FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
