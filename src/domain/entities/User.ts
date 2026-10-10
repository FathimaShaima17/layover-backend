/**
 * User entity — an authenticated explorer of the HiddenAtlas community.
 *
 * The public `User` shape deliberately excludes `passwordHash`;
 * authenticated lookups return `UserWithPassword` internally.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  role: string;
  contributionsCount: number;
  createdAt?: string;
}

/** User record including the stored password hash (internal use only). */
export interface UserWithPassword extends User {
  passwordHash: string;
}

/** Payload accepted when registering a new account. */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** Payload accepted when signing in. */
export interface LoginInput {
  email: string;
  password: string;
}

/** Successful authentication result returned to the client. */
export interface AuthResult {
  token: string;
  user: User;
}

/** Fields a user may update on their own profile. */
export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}
