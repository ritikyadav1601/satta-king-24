import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const COOKIE_NAME = "skf_session";

function secret() {
  return process.env.SESSION_SECRET || "local-development-secret-change-me";
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function makeSession(userId) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function readSession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  if (sign(payload) !== parts[2]) return null;
  return { userId: parts[0], createdAt: Number(parts[1]) };
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = readSession(token);
  if (!session) return null;
  await connectDB();
  return User.findById(session.userId).lean();
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function verifyPassword(password, hash) {
  const normalizedHash = String(hash || "").replace(/^\$2y\$/, "$2b$");
  return bcrypt.compare(password, normalizedHash);
}

export function sessionCookieName() {
  return COOKIE_NAME;
}
