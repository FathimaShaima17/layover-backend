import { IUserRepository } from '../../domain/repositories/IUserRepository';
import {
  User,
  RegisterInput,
  UserWithPassword,
  UpdateProfileInput,
} from '../../domain/entities/User';
import { UserModel, UserDocument } from '../database/UserModel';

/**
 * MongoDB implementation of IUserRepository using Mongoose.
 * All public methods return plain domain objects without password hashes.
 */
export class MongoUserRepository implements IUserRepository {
  /** Converts a Mongoose document to a plain domain User (no passwordHash). */
  private toUser(doc: UserDocument): User {
    const json = doc.toJSON() as unknown as User;
    return json;
  }

  /** Converts a Mongoose document to an internal User including passwordHash. */
  private toUserWithPassword(doc: UserDocument): UserWithPassword {
    const json = doc.toJSON() as unknown as UserWithPassword;
    return { ...json, passwordHash: doc.passwordHash };
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return this.toUserWithPassword(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toUser(doc);
  }

  async create(input: RegisterInput, passwordHash: string): Promise<User> {
    const doc = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    return this.toUser(doc);
  }

  async updateProfile(id: string, patch: UpdateProfileInput): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!doc) return null;
    return this.toUser(doc);
  }
}
