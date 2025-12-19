// Demo mode - all users are admins
export type UserRole = 'admin' | 'viewer';

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

// Demo user - always admin
const demoUser: AuthUser = {
  userId: 'demo-user',
  email: 'demo@votracker.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'admin',
};

export async function getUserRole(): Promise<UserRole> {
  return 'admin';
}

export async function getAuthUser(): Promise<AuthUser | null> {
  return demoUser;
}

export async function requireAuth(): Promise<AuthUser> {
  return demoUser;
}

export async function requireAdmin(): Promise<AuthUser> {
  return demoUser;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
