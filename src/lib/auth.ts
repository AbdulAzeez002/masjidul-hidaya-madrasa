import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nasruthul-islam-kiyakethala-secret-key-2026'
);

const COOKIE_NAME = 'ni_session_token';

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    memberCode: user.memberCode,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days for elderly convenience (no frequent logouts)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'member',
      memberCode: payload.memberCode as string | undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
