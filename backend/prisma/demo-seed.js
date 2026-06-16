import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();
const demoPassword = "Demo123!";

const categories = [
  { name: "Streaming", color: "#ef4444" },
  { name: "Sports", color: "#ea580c" },
  { name: "Music", color: "#10b981" },
  { name: "Software", color: "#3b82f6" },
  { name: "Fitness", color: "#8b5cf6" },
  { name: "Cloud", color: "#6366f1" },
  { name: "AI", color: "#9333ea" },
  { name: "Telecom", color: "#0891b2" },
  { name: "Insurance", color: "#0f766e" },
  { name: "Gaming", color: "#db2777" },
  { name: "Productivity", color: "#f59e0b" },
  { name: "Finance", color: "#059669" },
  { name: "Press", color: "#64748b" },
  { name: "Professional", color: "#475569" },
  { name: "Other", color: "#94a3b8" }
];

const users = [
  {
    name: "Alex Student",
    email: "alex.student@demo.local",
    role: "USER",
    subscriptions: [
      ["Netflix", "Premium Plan", "19.99", "MONTHLY", "ACTIVE", 1, "Visa 4242", "Streaming"],
      ["Spotify", "Student Plan", "5.99", "MONTHLY", "ACTIVE", 3, "Visa 4242", "Music"],
      ["Adobe Creative Cloud", "Student & Teacher", "239.88", "ANNUAL", "ACTIVE", 12, "Mastercard 8888", "Software"],
      ["Figma", "Professional Plan", "12.00", "MONTHLY", "ACTIVE", 18, "Visa 4242", "Productivity"],
      ["Anytime Fitness", "Monthly Membership", "74.98", "MONTHLY", "INACTIVE", 25, "SEPA", "Fitness"],
      ["Canva Pro", "Design exports", "119.99", "ANNUAL", "ARCHIVED", -20, "Visa 4242", "Software"]
    ]
  },
  {
    name: "Jamie Doe",
    email: "jamie.doe@demo.local",
    role: "USER",
    subscriptions: [
      ["YouTube Premium", "Family Plan", "23.99", "MONTHLY", "ACTIVE", 6, "PayPal", "Streaming"],
      ["GitHub Copilot", "Developer tools", "10.00", "MONTHLY", "ACTIVE", 9, "Visa 1111", "Software"],
      ["iCloud+", "Cloud storage", "2.99", "MONTHLY", "ACTIVE", 17, "Apple Pay", "Cloud"],
      ["Notion Plus", "Workspace", "96.00", "ANNUAL", "ACTIVE", 28, "Visa 1111", "Productivity"]
    ]
  },
  {
    name: "Casey Smith",
    email: "casey.smith@demo.local",
    role: "USER",
    isActive: false,
    subscriptions: [
      ["Disney+", "Standard", "8.99", "MONTHLY", "INACTIVE", 11, "Mastercard 2222", "Streaming"],
      ["Dropbox", "Plus", "119.88", "ANNUAL", "ARCHIVED", -8, "Mastercard 2222", "Cloud"]
    ]
  },
  {
    name: "Louis Delarue",
    email: "louis.delarue@demo.local",
    role: "ADMIN",
    subscriptions: [
      ["Railway", "Backend hosting", "5.00", "MONTHLY", "ACTIVE", 5, "Visa 3333", "Cloud"],
      ["Vercel Pro", "Frontend hosting", "20.00", "MONTHLY", "ACTIVE", 14, "Visa 3333", "Cloud"]
    ]
  },
  {
    name: "Ethan Porcarro",
    email: "ethan.porcarro@demo.local",
    role: "ADMIN",
    subscriptions: [
      ["ChatGPT Plus", "AI assistant", "20.00", "MONTHLY", "ACTIVE", 2, "Visa 4444", "Productivity"],
      ["Meal Box", "Weekly food plan", "36.80", "WEEKLY", "ACTIVE", 7, "Visa 4444", "Other"]
    ]
  }
];

function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

async function main() {
  const hashedPassword = await bcrypt.hash(demoPassword, 12);
  const categoryMap = new Map();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
    categoryMap.set(savedCategory.name, savedCategory.id);
  }

  for (const demoUser of users) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        password: hashedPassword,
        role: demoUser.role,
        isActive: demoUser.isActive ?? true
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role,
        isActive: demoUser.isActive ?? true
      }
    });

    await prisma.subscription.deleteMany({ where: { userId: user.id } });

    for (const [name, description, price, billingCycle, status, daysUntilRenewal, paymentMethod, categoryName] of demoUser.subscriptions) {
      await prisma.subscription.create({
        data: {
          name,
          description,
          price,
          billingCycle,
          status,
          renewalDate: dateFromToday(daysUntilRenewal),
          paymentMethod,
          userId: user.id,
          categoryId: categoryMap.get(categoryName)
        }
      });
    }
  }

  console.log(`Demo seed completed. ${users.length} users created/updated.`);
  console.log(`Demo password for all demo users: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
