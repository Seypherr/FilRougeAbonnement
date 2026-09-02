-- Private beta invitations and the account language used by transactional email.
ALTER TABLE "users"
  ADD COLUMN "preferred_language" VARCHAR(2) NOT NULL DEFAULT 'fr';

CREATE TABLE "beta_invites" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "beta_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "beta_invites_email_key" ON "beta_invites"("email");
CREATE UNIQUE INDEX "beta_invites_token_hash_key" ON "beta_invites"("token_hash");
CREATE INDEX "beta_invites_expires_at_idx" ON "beta_invites"("expires_at");
CREATE INDEX "beta_invites_revoked_at_idx" ON "beta_invites"("revoked_at");

ALTER TABLE "beta_invites"
  ADD CONSTRAINT "beta_invites_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
