/**
 * Data Transfer Objects for the authentication endpoints.
 * These describe the shape of incoming request bodies.
 */
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    role: string;
    contributionsCount: number;
    createdAt?: string;
  };
}
