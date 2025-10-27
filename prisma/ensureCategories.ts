import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Categories needed based on the menu
const requiredCategories = [
  {
    name: "STARTER",
    description: "Appetizers and small bites to start your meal",
    isActive: true,
  },
  {
    name: "CHOWMEIN",
    description: "Stir-fried noodle dishes",
    isActive: true,
  },
  {
    name: "BIRYANI",
    description: "Aromatic rice dishes with spices",
    isActive: true,
  },
  {
    name: "SEKUWA/SUKUTI",
    description: "Grilled and dried meat specialties",
    isActive: true,
  },
  {
    name: "CURRY",
    description: "Traditional curry dishes",
    isActive: true,
  },
  {
    name: "THALI",
    description: "Complete meal platters with variety",
    isActive: true,
  },
  {
    name: "FRIED RICE",
    description: "Stir-fried rice dishes",
    isActive: true,
  },
  {
    name: "DUMPLING/MOMO",
    description: "Traditional Nepali dumplings - steamed, fried, or in soup",
    isActive: true,
  },
  {
    name: "SIDES",
    description: "Accompaniments and side dishes",
    isActive: true,
  },
  {
    name: "DRINKS",
    description: "Beverages and refreshments",
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Ensuring all required categories exist...\n");

  let created = 0;
  let existing = 0;

  for (const category of requiredCategories) {
    const existingCategory = await prisma.menuCategory.findFirst({
      where: { name: category.name },
    });

    if (existingCategory) {
      console.log(`✓ Category already exists: ${category.name}`);
      existing++;
    } else {
      await prisma.menuCategory.create({
        data: category,
      });
      console.log(`✨ Created category: ${category.name}`);
      created++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Category Setup Summary:");
  console.log(`  ✨ Created: ${created}`);
  console.log(`  ✓ Already Existed: ${existing}`);
  console.log(`  📝 Total Categories: ${requiredCategories.length}`);
  console.log("=".repeat(50));
  console.log("🎉 All required categories are now in place!");
  console.log("\n💡 Next step: Run the menu items seeder:");
  console.log("   npx ts-node prisma/seedMenuItemsFromImage.ts");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
