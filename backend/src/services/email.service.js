import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function buildFrontendUrl(path, token) {
  const origin = env.CLIENT_ORIGINS[0] ?? "http://localhost:5173";
  const url = new URL(path, origin);
  url.searchParams.set("token", token);
  return url.toString();
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

function buildActionEmail({ title, intro, actionLabel, url }) {
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
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
        <a href="${url}" style="color: #7047EB;">${url}</a>
      </p>
    </div>
  `;
}

export async function sendVerificationEmail(user, token) {
  const url = buildFrontendUrl("/verify-email", token);
  logger.info(`Email verification link prepared for ${user.email}: ${url}`);
  await sendTransactionalEmail({
    to: user.email,
    subject: "Verifiez votre adresse email",
    html: buildActionEmail({
      title: "Verifiez votre adresse email",
      intro: "Bienvenue dans Frovely. Cliquez sur le bouton ci-dessous pour activer votre compte.",
      actionLabel: "Verifier mon email",
      url
    }),
    text: `Verifiez votre adresse email : ${url}`
  });
  return url;
}

export async function sendPasswordResetEmail(user, token) {
  const url = buildFrontendUrl("/reset-password", token);
  logger.info(`Password reset link prepared for ${user.email}: ${url}`);
  await sendTransactionalEmail({
    to: user.email,
    subject: "Reinitialisation de votre mot de passe",
    html: buildActionEmail({
      title: "Reinitialisation de votre mot de passe",
      intro: "Vous avez demande a reinitialiser votre mot de passe. Ce lien expire dans 30 minutes.",
      actionLabel: "Reinitialiser mon mot de passe",
      url
    }),
    text: `Reinitialisez votre mot de passe : ${url}`
  });
  return url;
}

