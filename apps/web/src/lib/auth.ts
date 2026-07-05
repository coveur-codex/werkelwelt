"use client";

export type UserRole = "admin" | "parent";
export type UserAccount = { id: string; email: string; displayName: string; role: UserRole; passwordHash: string; isActive: boolean; createdAt: string; updatedAt: string };
export type Session = { userId: string; role: UserRole; activeChildProfileId?: string };

const USERS_KEY = "werkelwelt.users.v1";
const SESSION_KEY = "werkelwelt.session.v1";

const enc = new TextEncoder();
function readJson<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function writeJson<T>(key: string, value: T) { window.localStorage.setItem(key, JSON.stringify(value)); }
function emit() { window.dispatchEvent(new Event("werkelwelt-auth")); }
function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string) { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)) as Uint8Array<ArrayBuffer>; }
async function derive(password: string, salt: Uint8Array<ArrayBuffer>) { const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256); return bytesToBase64(new Uint8Array(bits)); }
export async function hashPassword(password: string) { const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>; return `pbkdf2-sha256$210000$${bytesToBase64(salt)}$${await derive(password, salt)}`; }
export async function verifyPassword(password: string, stored: string) { const [algo, , salt, hash] = stored.split("$"); if (algo !== "pbkdf2-sha256" || !salt || !hash) return false; return await derive(password, base64ToBytes(salt)) === hash; }

export function listUsers() { return readJson<UserAccount[]>(USERS_KEY, []); }
export function saveUsers(users: UserAccount[]) { writeJson(USERS_KEY, users); emit(); }
export function getCurrentSession() { return readJson<Session | null>(SESSION_KEY, null); }
export function getCurrentUser() { const session = getCurrentSession(); return session ? listUsers().find((user) => user.id === session.userId) : undefined; }
export function setSession(session: Session | null) { if (session) { writeJson(SESSION_KEY, session); document.cookie = `ww_session=${session.role}:${session.userId}; path=/; SameSite=Lax`; } else { window.localStorage.removeItem(SESSION_KEY); document.cookie = "ww_session=; path=/; max-age=0; SameSite=Lax"; } emit(); }
export async function createUser(input: { email: string; displayName: string; role: UserRole; password: string; isActive?: boolean }) { const now = new Date().toISOString(); const users = listUsers(); if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) throw new Error("email_exists"); const user: UserAccount = { id: crypto.randomUUID(), email: input.email.trim().toLowerCase(), displayName: input.displayName.trim(), role: input.role, passwordHash: await hashPassword(input.password), isActive: input.isActive ?? true, createdAt: now, updatedAt: now }; saveUsers([...users, user]); return user; }
export async function updateUser(id: string, input: Partial<Pick<UserAccount, "email" | "displayName" | "isActive">> & { password?: string }) { const users = listUsers(); const existing = users.find((u) => u.id === id); if (!existing) throw new Error("not_found"); const next: UserAccount = { ...existing, ...input, email: input.email?.trim().toLowerCase() ?? existing.email, displayName: input.displayName?.trim() ?? existing.displayName, updatedAt: new Date().toISOString() }; if (input.password) next.passwordHash = await hashPassword(input.password); saveUsers(users.map((user) => user.id === id ? next : user)); return next; }
export async function login(email: string, password: string) { const user = listUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase()); if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) return null; const session: Session = { userId: user.id, role: user.role }; setSession(session); return user; }
export function logout() { setSession(null); }
export async function seedInitialAdminFromEnv() { if (listUsers().some((user) => user.role === "admin")) return; const email = process.env.NEXT_PUBLIC_INITIAL_ADMIN_EMAIL; const password = process.env.NEXT_PUBLIC_INITIAL_ADMIN_PASSWORD; const displayName = process.env.NEXT_PUBLIC_INITIAL_ADMIN_NAME ?? "Admin"; if (email && password) await createUser({ email, password, displayName, role: "admin" }); }
export function safeUser(user: UserAccount) { const { passwordHash: _passwordHash, ...safe } = user; return safe; }
