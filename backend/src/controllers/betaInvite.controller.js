import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { createSecureToken, hashToken } from "../services/auth.service.js";
import { buildBetaInviteUrl, isEmailDeliveryConfigured, sendBetaInviteEmail } from "../services/email.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

function inviteStatus(invite, now = new Date()) {
  if (invite.revokedAt) return "REVOKED";
  if (invite.usedAt) return "USED";
  if (invite.expiresAt <= now) return "EXPIRED";
  return "ACTIVE";
}

function publicInvite(invite) {
  return {
    id: invite.id,
    email: invite.email,
    expiresAt: invite.expiresAt,
    usedAt: invite.usedAt,
    revokedAt: invite.revokedAt,
    createdAt: invite.createdAt,
    status: inviteStatus(invite)
  };
}

function csvCell(value) {
  const text = String(value ?? "");
  const neutralized = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return JSON.stringify(neutralized);
}

export const listBetaInvites = asyncHandler(async (_req, res) => {
  const invites = await prisma.betaInvite.findMany({
    select: {
      id: true,
      email: true,
      expiresAt: true,
      usedAt: true,
      revokedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ invites: invites.map(publicInvite), limit: env.BETA_INVITE_LIMIT });
});

export const createBetaInvite = asyncHandler(async (req, res) => {
  const now = new Date();
  const existing = await prisma.betaInvite.findUnique({ where: { email: req.body.email } });

  if (existing && inviteStatus(existing, now) === "ACTIVE") {
    throw new HttpError(409, "An active beta invitation already exists for this email");
  }
  if (existing?.usedAt) {
    throw new HttpError(409, "This email has already used its beta invitation");
  }

  const activeInvites = await prisma.betaInvite.count({
    where: { usedAt: null, revokedAt: null, expiresAt: { gt: now } }
  });
  if (activeInvites >= env.BETA_INVITE_LIMIT) {
    throw new HttpError(409, `The beta cohort is limited to ${env.BETA_INVITE_LIMIT} active invitations`);
  }

  const token = createSecureToken();
  const data = {
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    usedAt: null,
    revokedAt: null,
    createdById: req.user.id
  };
  const invite = existing
    ? await prisma.betaInvite.update({ where: { id: existing.id }, data })
    : await prisma.betaInvite.create({ data: { email: req.body.email, ...data } });

  const inviteUrl = buildBetaInviteUrl(token);
  let emailDeliveryFailed = false;
  try {
    await sendBetaInviteEmail({
      email: invite.email,
      token,
      language: req.body.preferredLanguage
    });
  } catch {
    emailDeliveryFailed = true;
  }

  res.status(201).json({
    invite: publicInvite(invite),
    inviteUrl,
    emailDeliveryConfigured: isEmailDeliveryConfigured(),
    emailDeliveryFailed
  });
});

export const revokeBetaInvite = asyncHandler(async (req, res) => {
  const invite = await prisma.betaInvite.findUnique({ where: { id: req.params.id } });
  if (!invite) throw new HttpError(404, "Beta invitation not found");
  if (invite.usedAt) throw new HttpError(409, "A used beta invitation cannot be revoked");

  const revoked = await prisma.betaInvite.update({
    where: { id: invite.id },
    data: { revokedAt: new Date() }
  });
  res.json({ invite: publicInvite(revoked) });
});

export const exportBetaInvites = asyncHandler(async (_req, res) => {
  const invites = await prisma.betaInvite.findMany({
    select: { email: true, expiresAt: true, usedAt: true, revokedAt: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });
  const rows = ["email,status,created_at,expires_at,used_at"];
  for (const invite of invites) {
    rows.push([
      csvCell(invite.email),
      csvCell(inviteStatus(invite)),
      csvCell(invite.createdAt.toISOString()),
      csvCell(invite.expiresAt.toISOString()),
      csvCell(invite.usedAt?.toISOString() ?? "")
    ].join(","));
  }

  res.set({
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": "attachment; filename=\"frovely-beta-cohort.csv\"",
    "Cache-Control": "no-store"
  });
  res.send(rows.join("\n"));
});
