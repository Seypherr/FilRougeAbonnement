-- International account settings, beta entitlements, and reliable email reminders.
CREATE TYPE "AccessPlan" AS ENUM ('FREE', 'BETA', 'PREMIUM');
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL');
CREATE TYPE "ReminderDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE "users"
  ADD COLUMN "preferred_currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
  ADD COLUMN "time_zone" TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN "reminder_email_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "reminder_days_before" INTEGER[] NOT NULL DEFAULT ARRAY[7, 3, 1],
  ADD COLUMN "access_plan" "AccessPlan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);

-- Existing accounts were displayed in euro and receive beta access for this release.
UPDATE "users" SET "access_plan" = 'BETA';

ALTER TABLE "subscriptions"
  ALTER COLUMN "renewal_date" TYPE DATE USING "renewal_date"::date;

CREATE TABLE "reminder_deliveries" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "subscription_id" TEXT NOT NULL,
  "renewal_date" DATE NOT NULL,
  "days_before" INTEGER NOT NULL,
  "channel" "ReminderChannel" NOT NULL DEFAULT 'EMAIL',
  "status" "ReminderDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "sent_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reminder_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_product_metrics" (
  "id" TEXT NOT NULL,
  "event_date" DATE NOT NULL,
  "event_type" VARCHAR(64) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_product_metrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reminder_deliveries_subscription_id_renewal_date_days_before_channel_key"
  ON "reminder_deliveries"("subscription_id", "renewal_date", "days_before", "channel");
CREATE INDEX "reminder_deliveries_status_created_at_idx" ON "reminder_deliveries"("status", "created_at");
CREATE UNIQUE INDEX "daily_product_metrics_event_date_event_type_key"
  ON "daily_product_metrics"("event_date", "event_type");

ALTER TABLE "reminder_deliveries"
  ADD CONSTRAINT "reminder_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "reminder_deliveries_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
