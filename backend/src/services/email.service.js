import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export function isEmailDeliveryConfigured() {
  return Boolean(resend);
}

const emailCopy = {
  fr: {
    copyLink: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    verifySubject: "Verifiez votre adresse email",
    verifyTitle: "Verifiez votre adresse email",
    verifyIntro: "Bienvenue dans Frovely. Cliquez sur le bouton ci-dessous pour activer votre compte.",
    verifyAction: "Verifier mon email",
    resetSubject: "Reinitialisation de votre mot de passe",
    resetTitle: "Reinitialisation de votre mot de passe",
    resetIntro: "Vous avez demande a reinitialiser votre mot de passe. Ce lien expire dans 30 minutes.",
    resetAction: "Reinitialiser mon mot de passe",
    inviteSubject: "Bravo, votre acces beta Frovely est pret",
    inviteTitle: "Bravo, vous avez gagne votre acces a la beta Frovely",
    inviteIntro: "Voici votre lien personnel pour creer votre compte et rejoindre la beta privee de Frovely. Ce lien expire dans 14 jours.",
    inviteAction: "Creer mon compte",
    reminderTitle: "Votre renouvellement approche",
    reminderProfile: "Vous pouvez modifier vos rappels depuis votre profil Frovely.",
    today: "aujourd'hui",
    tomorrow: "demain",
    inDays: (days) => `dans ${days} jours`,
    renewalSubject: (name, timing) => `Rappel Frovely : ${name} se renouvelle ${timing}`,
    renewalBody: (timing, date) => `se renouvelle ${timing}, le ${date}.`,
    renewalText: (name, timing, date) => `Rappel Frovely : ${name} se renouvelle ${timing}, le ${date}.`
  },
  en: {
    copyLink: "If the button does not work, copy this link into your browser:",
    verifySubject: "Verify your email address",
    verifyTitle: "Verify your email address",
    verifyIntro: "Welcome to Frovely. Click the button below to activate your account.",
    verifyAction: "Verify my email",
    resetSubject: "Reset your password",
    resetTitle: "Reset your password",
    resetIntro: "You requested a password reset. This link expires in 30 minutes.",
    resetAction: "Reset my password",
    inviteSubject: "Congrats, your Frovely beta access is ready",
    inviteTitle: "Congrats, you earned access to the Frovely beta",
    inviteIntro: "Here is your personal link to create your account and join the private Frovely beta. This link expires in 14 days.",
    inviteAction: "Create my account",
    reminderTitle: "Your renewal is coming up",
    reminderProfile: "You can change reminder settings at any time in your Frovely profile.",
    today: "today",
    tomorrow: "tomorrow",
    inDays: (days) => `in ${days} days`,
    renewalSubject: (name, timing) => `Frovely reminder: ${name} renews ${timing}`,
    renewalBody: (timing, date) => `renews ${timing}, on ${date}.`,
    renewalText: (name, timing, date) => `Frovely reminder: ${name} renews ${timing}, on ${date}.`
  },
  es: {
    copyLink: "Si el boton no funciona, copia este enlace en tu navegador:",
    verifySubject: "Verifica tu direccion de correo",
    verifyTitle: "Verifica tu direccion de correo",
    verifyIntro: "Te damos la bienvenida a Frovely. Haz clic para activar tu cuenta.",
    verifyAction: "Verificar mi correo",
    resetSubject: "Restablece tu contrasena",
    resetTitle: "Restablece tu contrasena",
    resetIntro: "Solicitaste restablecer tu contrasena. Este enlace vence en 30 minutos.",
    resetAction: "Restablecer mi contrasena",
    inviteSubject: "Felicidades, tu acceso beta a Frovely esta listo",
    inviteTitle: "Felicidades, conseguiste acceso a la beta de Frovely",
    inviteIntro: "Aqui tienes tu enlace personal para crear tu cuenta y unirte a la beta privada de Frovely. Este enlace vence en 14 dias.",
    inviteAction: "Crear mi cuenta",
    reminderTitle: "Tu renovacion se acerca",
    reminderProfile: "Puedes cambiar los recordatorios desde tu perfil de Frovely.",
    today: "hoy",
    tomorrow: "manana",
    inDays: (days) => `en ${days} dias`,
    renewalSubject: (name, timing) => `Recordatorio Frovely: ${name} se renueva ${timing}`,
    renewalBody: (timing, date) => `se renueva ${timing}, el ${date}.`,
    renewalText: (name, timing, date) => `Recordatorio Frovely: ${name} se renueva ${timing}, el ${date}.`
  }
};

function getEmailCopy(language) {
  return emailCopy[language] ?? emailCopy.fr;
}

function buildFrontendUrl(path, searchParams) {
  const origin = env.CLIENT_ORIGINS[0] ?? "http://localhost:5173";
  const url = new URL(path, origin);
  for (const [key, value] of Object.entries(searchParams)) url.searchParams.set(key, value);
  return url.toString();
}

export function buildBetaInviteUrl(token) {
  return buildFrontendUrl("/", { invite: token });
}

async function sendTransactionalEmail({ to, subject, html, text }) {
  if (!resend) {
    logger.warn(`Email provider not configured. Email not sent to ${to}.`);
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [to],
    subject,
    html,
    text,
    ...(env.EMAIL_REPLY_TO ? { replyTo: env.EMAIL_REPLY_TO } : {})
  });

  if (error) {
    logger.error("Resend email delivery failed", { to, subject, error });
    throw new Error("Unable to send email");
  }

  logger.info(`Email sent to ${to} with Resend`, { emailId: data?.id, subject });
  return data;
}

function buildActionEmail({ title, intro, actionLabel, url, copyLink }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #101828;">
      <h1 style="font-size: 24px; margin: 0 0 12px;">${title}</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #475467;">${intro}</p>
      <p style="margin: 28px 0;">
        <a href="${url}" style="display: inline-block; background: #7047EB; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: 700;">
          ${actionLabel}
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.5; color: #667085;">
        ${copyLink}<br />
        <a href="${url}" style="color: #7047EB;">${url}</a>
      </p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

export async function sendRenewalReminderEmail({ user, subscription, daysUntil, timeZone }) {
  const copy = getEmailCopy(user.preferredLanguage);
  const locale = { fr: "fr-FR", en: "en-US", es: "es-ES" }[user.preferredLanguage] ?? "fr-FR";
  const renewalDate = new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(subscription.renewalDate);
  const timing = daysUntil === 0 ? copy.today : daysUntil === 1 ? copy.tomorrow : copy.inDays(daysUntil);
  const name = escapeHtml(subscription.name);

  const safeName = String(subscription.name).replace(/[\r\n]+/g, " ").trim();

  return sendTransactionalEmail({
    to: user.email,
    subject: copy.renewalSubject(safeName, timing),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #101828;">
        <h1 style="font-size: 24px; margin: 0 0 12px;">${copy.reminderTitle}</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #475467;"><strong>${name}</strong> ${escapeHtml(copy.renewalBody(timing, renewalDate))}</p>
        <p style="font-size: 14px; line-height: 1.5; color: #667085;">${copy.reminderProfile}</p>
      </div>
    `,
    text: copy.renewalText(safeName, timing, renewalDate)
  });
}

export async function sendVerificationEmail(user, token) {
  const copy = getEmailCopy(user.preferredLanguage);
  const url = buildFrontendUrl("/verify-email", { token });
  logger.info(`Email verification link prepared for ${user.email}`);
  await sendTransactionalEmail({
    to: user.email,
    subject: copy.verifySubject,
    html: buildActionEmail({
      title: copy.verifyTitle,
      intro: copy.verifyIntro,
      actionLabel: copy.verifyAction,
      url,
      copyLink: copy.copyLink
    }),
    text: `${copy.verifySubject}: ${url}`
  });
  return url;
}

export async function sendPasswordResetEmail(user, token) {
  const copy = getEmailCopy(user.preferredLanguage);
  const url = buildFrontendUrl("/reset-password", { token });
  logger.info(`Password reset link prepared for ${user.email}`);
  await sendTransactionalEmail({
    to: user.email,
    subject: copy.resetSubject,
    html: buildActionEmail({
      title: copy.resetTitle,
      intro: copy.resetIntro,
      actionLabel: copy.resetAction,
      url,
      copyLink: copy.copyLink
    }),
    text: `${copy.resetSubject}: ${url}`
  });
  return url;
}

export async function sendBetaInviteEmail({ email, token, language }) {
  const copy = getEmailCopy(language);
  const url = buildBetaInviteUrl(token);
  logger.info(`Beta invitation prepared for ${email}`);
  await sendTransactionalEmail({
    to: email,
    subject: copy.inviteSubject,
    html: buildActionEmail({
      title: copy.inviteTitle,
      intro: copy.inviteIntro,
      actionLabel: copy.inviteAction,
      url,
      copyLink: copy.copyLink
    }),
    text: `${copy.inviteSubject}: ${url}`
  });
  return url;
}

