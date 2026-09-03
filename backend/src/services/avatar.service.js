import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIN_SIZE = 300;
const AVATAR_MAX_SIZE = 4096;
const AVATAR_RATIO_MIN = 0.75;
const AVATAR_RATIO_MAX = 1.33;
const avatarTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function getUploadRoot() {
  return path.resolve(env.UPLOAD_ROOT ?? "uploads");
}

export function getPublicOrigin(req) {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function readPngSize(buffer) {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSignature)) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 4 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      if (length < 8) return null;
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function readWebpSize(buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  if (chunk === "VP8 " && buffer.length >= 30) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function getImageSize(buffer, mimeType) {
  if (mimeType === "image/png") return readPngSize(buffer);
  if (mimeType === "image/jpeg") return readJpegSize(buffer);
  if (mimeType === "image/webp") return readWebpSize(buffer);
  return null;
}

export function assertValidAvatarUpload(buffer, mimeType) {
  if (!avatarTypes[mimeType]) {
    throw new HttpError(400, "Unsupported avatar image format");
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > AVATAR_MAX_BYTES) {
    throw new HttpError(400, "Avatar image is too large");
  }
  const size = getImageSize(buffer, mimeType);
  if (!size) {
    throw new HttpError(400, "Invalid avatar image");
  }
  const ratio = size.width / size.height;
  if (size.width < AVATAR_MIN_SIZE || size.height < AVATAR_MIN_SIZE || size.width > AVATAR_MAX_SIZE || size.height > AVATAR_MAX_SIZE || ratio < AVATAR_RATIO_MIN || ratio > AVATAR_RATIO_MAX) {
    throw new HttpError(400, "Avatar image dimensions are invalid");
  }
}

export async function saveAvatarUpload({ buffer, mimeType, userId, publicOrigin }) {
  assertValidAvatarUpload(buffer, mimeType);

  const extension = avatarTypes[mimeType];
  const filename = `${userId}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const avatarDirectory = path.join(getUploadRoot(), "avatars");
  await fs.mkdir(avatarDirectory, { recursive: true });
  await fs.writeFile(path.join(avatarDirectory, filename), buffer, { flag: "wx" });

  return `${publicOrigin}/uploads/avatars/${filename}`;
}
