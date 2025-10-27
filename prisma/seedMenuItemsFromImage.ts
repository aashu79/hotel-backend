import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface MenuItem {
  name: string;
  description: string;
  price: number;
  isVegetarian: boolean;
  isAvailable: boolean;
  prepTimeMins: number;
  category: string;
  imageUrl?: string;
}

async function main() {
  console.log("🌱 Starting menu items seeding...");

  // Read the menu items from JSON file
  const menuItemsPath = path.join(__dirname, "..", "menuItemsFromImage.json");
  const menuItemsData: MenuItem[] = JSON.parse(
    fs.readFileSync(menuItemsPath, "utf-8")
  );

  console.log(`📋 Found ${menuItemsData.length} menu items to seed`);

  // Fetch all existing categories
  const categories = await prisma.menuCategory.findMany();
  console.log(`📁 Found ${categories.length} existing categories`);

  if (categories.length === 0) {
    console.log("❌ No categories found. Please seed categories first!");
    console.log(
      "Run: npx ts-node prisma/seedMenuCategory.ts or create categories manually"
    );
    return;
  }

  // Create a map of category names (normalized) to category IDs
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat.name.toUpperCase(), cat.id);
  });

  console.log("\n📂 Available categories:");
  categories.forEach((cat) => {
    console.log(`  - ${cat.name} (${cat.id})`);
  });

  // Keep track of stats
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process each menu item
  for (const item of menuItemsData) {
    try {
      // Find the category ID based on the category name from JSON
      const categoryId = categoryMap.get(item.category.toUpperCase());

      if (!categoryId) {
        console.log(
          `⚠️  Skipping "${item.name}" - Category "${item.category}" not found`
        );
        skipped++;
        continue;
      }

      // Check if item already exists (by name)
      const existingItem = await prisma.menuItem.findFirst({
        where: { name: item.name },
      });

      if (existingItem) {
        // Update existing item
        await prisma.menuItem.update({
          where: { id: existingItem.id },
          data: {
            description: item.description,
            price: item.price,
            isVegetarian: item.isVegetarian,
            isAvailable: item.isAvailable,
            prepTimeMins: item.prepTimeMins,
            categoryId: categoryId,
            imageUrl: item.imageUrl || null,
          },
        });
        console.log(`✅ Updated: ${item.name}`);
        updated++;
      } else {
        // Create new item
        await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description,
            price: item.price,
            isVegetarian: item.isVegetarian,
            isAvailable: item.isAvailable,
            prepTimeMins: item.prepTimeMins,
            categoryId: categoryId,
            imageUrl: item.imageUrl || null,
          },
        });
        console.log(`✨ Created: ${item.name}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing "${item.name}":`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Seeding Summary:");
  console.log(`  ✨ Created: ${created}`);
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⚠️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📝 Total Processed: ${menuItemsData.length}`);
  console.log("=".repeat(50));
  console.log("🎉 Menu items seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
