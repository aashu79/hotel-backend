// Seeder for MenuCategory using menucategory.json
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, "../menucategory.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  await prisma.menuCategory.createMany({
    data: data.map((category: any) => ({
      name: category.name,
      description: category.description || null,
      isActive: true,
    })),
    skipDuplicates: true,
  });
  console.log("Menu categories seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
