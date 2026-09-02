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

const addDays = (days) => {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
};

const demoSubscriptions = [
  { name: "Netflix", description: "Forfait series et films partage en famille.", price: 17.99, billingCycle: "MONTHLY", renewalDate: addDays(2), status: "ACTIVE", paymentMethod: "Visa 4242", category: "Streaming" },
  { name: "Spotify Premium", description: null, price: 11.12, billingCycle: "MONTHLY", renewalDate: addDays(5), status: "ACTIVE", paymentMethod: "Visa 4242", category: "Music" },
  { name: "ChatGPT Plus", description: "Assistant IA pour le travail et les projets personnels.", price: 20, billingCycle: "MONTHLY", renewalDate: addDays(8), status: "ACTIVE", paymentMethod: "Revolut", category: "AI" },
  { name: "iCloud+", description: null, price: 2.99, billingCycle: "MONTHLY", renewalDate: addDays(11), status: "ACTIVE", paymentMethod: null, category: "Cloud" },
  { name: "Adobe Creative Cloud", description: "Outils de creation pour les projets visuels.", price: 69.99, billingCycle: "MONTHLY", renewalDate: addDays(14), status: "ACTIVE", paymentMethod: "Visa 4242", category: "Software" },
  { name: "Basic-Fit", description: null, price: 24.99, billingCycle: "MONTHLY", renewalDate: addDays(17), status: "ACTIVE", paymentMethod: "Compte bancaire", category: "Fitness" },
  { name: "Free Mobile", description: "Forfait mobile personnel, appels et data inclus.", price: 19.99, billingCycle: "MONTHLY", renewalDate: addDays(20), status: "ACTIVE", paymentMethod: "Compte bancaire", category: "Telecom" },
  { name: "Le Monde", description: null, price: 12.99, billingCycle: "MONTHLY", renewalDate: addDays(23), status: "ACTIVE", paymentMethod: "Visa 4242", category: "Press" },
  { name: "Google One", description: "Espace de stockage partage avec le foyer.", price: 2.49, billingCycle: "MONTHLY", renewalDate: addDays(26), status: "ACTIVE", paymentMethod: null, category: "Cloud" },
  { name: "Revolut Premium", description: null, price: 9.99, billingCycle: "MONTHLY", renewalDate: addDays(29), status: "ACTIVE", paymentMethod: "Carte Revolut", category: "Finance" },
  { name: "PlayStation Plus", description: "Catalogue de jeux et multijoueur en ligne.", price: 71.99, billingCycle: "ANNUAL", renewalDate: addDays(33), status: "ACTIVE", paymentMethod: "Visa 4242", category: "Gaming" },
  { name: "Readwise Reader", description: "Lecture differée et sauvegarde d'articles.", price: 5.99, billingCycle: "WEEKLY", renewalDate: addDays(37), status: "ACTIVE", paymentMethod: "PayPal", category: "Productivity" },
  { name: "Canal+", description: "Abonnement mis en pause pendant la saison creuse.", price: 29.99, billingCycle: "MONTHLY", renewalDate: addDays(41), status: "INACTIVE", paymentMethod: "Visa 4242", category: "Streaming" },
  { name: "NordVPN", description: null, price: 59.88, billingCycle: "ANNUAL", renewalDate: addDays(46), status: "ARCHIVED", paymentMethod: "PayPal", category: "Software" },
  { name: "Disney+", description: "Ancien service de streaming archive.", price: 8.99, billingCycle: "MONTHLY", renewalDate: addDays(50), status: "ARCHIVED", paymentMethod: null, category: "Streaming" }
];

async function main() {
  const categoryByName = new Map();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
    categoryByName.set(category.name, savedCategory);
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
      emailVerified: true,
      accessPlan: "BETA"
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      accessPlan: "BETA"
    }
  });

  const seedDemoAccount = process.env.SEED_DEMO_ACCOUNT === "true" || process.env.NODE_ENV !== "production";

  if (seedDemoAccount) {
    const demoEmail = process.env.DEMO_EMAIL ?? "demo@frovely.app";
    const demoPassword = process.env.DEMO_PASSWORD ?? "Demo123!";
    const demoName = process.env.DEMO_NAME ?? "Sophie Martin";
    const hashedDemoPassword = await bcrypt.hash(demoPassword, 12);
    const demoUser = await prisma.user.upsert({
      where: { email: demoEmail },
      update: {
        name: demoName,
        password: hashedDemoPassword,
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
        preferredLanguage: "fr",
        preferredCurrency: "EUR",
        timeZone: "Europe/Paris",
        reminderEmailEnabled: true,
        reminderDaysBefore: [7, 3, 1],
        accessPlan: "BETA",
        role: "USER",
        isActive: true,
        onboardingCompletedAt: new Date()
      },
      create: {
        name: demoName,
        email: demoEmail,
        password: hashedDemoPassword,
        emailVerified: true,
        preferredLanguage: "fr",
        preferredCurrency: "EUR",
        timeZone: "Europe/Paris",
        reminderEmailEnabled: true,
        reminderDaysBefore: [7, 3, 1],
        accessPlan: "BETA",
        onboardingCompletedAt: new Date()
      }
    });

    await prisma.reminderDelivery.deleteMany({ where: { userId: demoUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: demoUser.id } });
    await prisma.subscription.createMany({
      data: demoSubscriptions.map((subscription) => ({
        name: subscription.name,
        description: subscription.description,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        renewalDate: subscription.renewalDate,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        userId: demoUser.id,
        categoryId: categoryByName.get(subscription.category)?.id ?? null
      }))
    });

    console.log(`Seed completed. Demo account: ${demoEmail} / ${demoPassword} (${demoSubscriptions.length} subscriptions)`);
    return;
  }

  console.log("Seed completed. Demo account skipped in production.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
