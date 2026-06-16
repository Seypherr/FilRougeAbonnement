import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const categories = [
  { name: "Streaming", color: "#dc2626" },
  { name: "Sports", color: "#ea580c" },
  { name: "Music", color: "#16a34a" },
  { name: "Software", color: "#2563eb" },
  { name: "Cloud", color: "#7c3aed" },
  { name: "AI", color: "#9333ea" },
  { name: "Telecom", color: "#0891b2" },
  { name: "Insurance", color: "#0f766e" },
  { name: "Fitness", color: "#8b5cf6" },
  { name: "Gaming", color: "#db2777" },
  { name: "Productivity", color: "#f59e0b" },
  { name: "Finance", color: "#059669" },
  { name: "Press", color: "#64748b" },
  { name: "Professional", color: "#475569" },
  { name: "Other", color: "#475569" }
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@subscription.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const name = process.env.ADMIN_NAME ?? "Admin Subscription";

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      emailVerified: true
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true
    }
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
