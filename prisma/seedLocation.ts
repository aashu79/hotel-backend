import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding default location...");

  // Create a default location for existing data
  const defaultLocation = await prisma.location.upsert({
    where: { id: "default-location-id" },
    update: {},
    create: {
      id: "default-location-id",
      name: "Main Branch",
      address: "123 Main Street",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      postalCode: "44600",
      phoneNumber: "+977-1-4123456",
      email: "main@himalayan-resto.com",
      isActive: true,
      openingHours: "Mon-Sun: 10:00 AM - 10:00 PM",
    },
  });

  console.log("✅ Default location created:", defaultLocation);

  // You can add more sample locations here
  const locations = [
    {
      name: "Downtown Branch",
      address: "456 Central Plaza",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      postalCode: "44601",
      phoneNumber: "+977-1-4234567",
      email: "downtown@himalayan-resto.com",
      isActive: true,
      openingHours: "Mon-Sun: 11:00 AM - 11:00 PM",
    },
    {
      name: "Airport Branch",
      address: "Tribhuvan International Airport",
      city: "Kathmandu",
      state: "Bagmati",
      country: "Nepal",
      postalCode: "44602",
      phoneNumber: "+977-1-4345678",
      email: "airport@himalayan-resto.com",
      isActive: true,
      openingHours: "24/7",
    },
  ];

  for (const location of locations) {
    const created = await prisma.location.upsert({
      where: {
        // Using a composite of name and city as unique identifier
        id: `${location.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${location.city.toLowerCase()}`,
      },
      update: location,
      create: {
        id: `${location.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${location.city.toLowerCase()}`,
        ...location,
      },
    });
    console.log("✅ Location created:", created.name);
  }

  // Add some sample delivery services for the default location
  const deliveryServices = [
    {
      name: "DoorDash",
      serviceUrl: "https://www.doordash.com/store/himalayan-resto",
      locationId: defaultLocation.id,
    },
    {
      name: "Uber Eats",
      serviceUrl: "https://www.ubereats.com/store/himalayan-resto",
      locationId: defaultLocation.id,
    },
    {
      name: "Grubhub",
      serviceUrl: "https://www.grubhub.com/restaurant/himalayan-resto",
      locationId: defaultLocation.id,
    },
  ];

  for (const service of deliveryServices) {
    const created = await prisma.deliveryService.create({
      data: service,
    });
    console.log("✅ Delivery service created:", created.name);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
