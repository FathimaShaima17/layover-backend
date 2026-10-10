import { User, RegisterInput, UserWithPassword, UpdateProfileInput } from '../entities/User';

/**
 * Domain-level repository interface for user accounts.
 * Infrastructure implementations must satisfy this contract.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<User | null>;
  create(input: RegisterInput, passwordHash: string): Promise<User>;
  updateProfile(id: string, patch: UpdateProfileInput): Promise<User | null>;
}
