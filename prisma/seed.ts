import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const menuItems = [
  { name: "Drip Coffee", priceCents: 300 },
  { name: "Latte", priceCents: 475 },
  { name: "Cappuccino", priceCents: 450 },
  { name: "Caramel Macchiato", priceCents: 525 },
  { name: "Mocha", priceCents: 525 },
  { name: "Cold Brew", priceCents: 425 },
  { name: "Hot Chocolate", priceCents: 350 },
  { name: "Chai Tea Latte", priceCents: 450 },
];

async function main() {
  // Idempotent seed: clear existing menu and reinsert. Orders are left untouched.
  await prisma.menuItem.deleteMany();
  await prisma.menuItem.createMany({ data: menuItems });
  console.log(`Seeded ${menuItems.length} menu items.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
