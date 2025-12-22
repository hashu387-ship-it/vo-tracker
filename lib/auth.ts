import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = 'admin' | 'viewer';

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl?: string;
}

export async function getUserRole(): Promise<UserRole> {
  // For now, all authenticated users are admins in this version
  // In the future, we can check publicMetadata from Clerk
  const session = auth();
  if (!session.userId) return 'viewer';
  return 'admin';
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    role: 'admin', // Default to admin for now
    imageUrl: user.imageUrl,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  return user;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
