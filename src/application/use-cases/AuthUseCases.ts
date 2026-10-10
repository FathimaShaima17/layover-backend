import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import {
  User,
  RegisterInput,
  LoginInput,
  AuthResult,
  UpdateProfileInput,
} from '../../domain/entities/User';
import { DomainError } from '../../domain/errors/DomainError';
import { jwtConfig, bcryptConfig } from '../../infrastructure/config/env';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * RegisterUseCase
 *
 * Validates registration input, rejects duplicate emails,
 * hashes the password and persists the new user.
 */
export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    // ─── Validation ───────────────────────────────────────────────
    const name = input.name?.trim() ?? '';
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';

    if (name.length < 2) {
      throw new DomainError('Name must be at least 2 characters long');
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new DomainError('Please provide a valid email address');
    }
    if (password.length < 8) {
      throw new DomainError('Password must be at least 8 characters long');
    }

    // ─── Duplicate check ──────────────────────────────────────────
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new DomainError('An account with this email already exists', 409);
    }

    // ─── Persist ──────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, bcryptConfig.saltRounds);
    const user: User = await this.userRepository.create(
      { name, email, password },
      passwordHash
    );

    return { token: this.signToken(user), user };
  }

  private signToken(user: User): string {
    return jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    );
  }
}

/**
 * LoginUseCase
 *
 * Verifies credentials and issues a signed JWT.
 * Always returns a generic message on failure to avoid
 * leaking whether an email is registered.
 */
export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new DomainError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new DomainError('Invalid email or password', 401);
    }

    const { passwordHash: _removed, ...publicUser } = user;
    return { token: this.signToken(publicUser), user: publicUser };
  }

  private signToken(user: User): string {
    return jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    );
  }
}

/**
 * GetProfileUseCase
 *
 * Returns the public profile of the authenticated user.
 */
export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainError('User not found', 404);
    }
    return user;
  }
}

/**
 * UpdateProfileUseCase
 *
 * Updates the authenticated user's editable fields.
 */
export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, patch: UpdateProfileInput): Promise<User> {
    const sanitized: UpdateProfileInput = {};
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (name.length < 2) {
        throw new DomainError('Name must be at least 2 characters long');
      }
      sanitized.name = name;
    }
    if (patch.bio !== undefined) {
      sanitized.bio = patch.bio.trim();
    }
    if (patch.avatarUrl !== undefined) {
      sanitized.avatarUrl = patch.avatarUrl.trim();
    }

    const updated = await this.userRepository.updateProfile(id, sanitized);
    if (!updated) {
      throw new DomainError('User not found', 404);
    }
    return updated;
  }
}
