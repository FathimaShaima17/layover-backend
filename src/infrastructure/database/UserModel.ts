import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../domain/entities/User';

/**
 * Mongoose Document interface.
 * Extends the domain User with the internal passwordHash field.
 */
export interface UserDocument extends Omit<User, 'id'>, Document {
  passwordHash: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name must be 120 characters or fewer'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio must be 500 characters or fewer'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'Explorer',
    },
    contributionsCount: {
      type: Number,
      default: 0,
      min: [0, 'Contributions must be non-negative'],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = String(ret['_id']);
        delete (ret as Record<string, unknown>)['_id'];
        delete (ret as Record<string, unknown>)['__v'];
        // NEVER leak the password hash through JSON
        delete (ret as Record<string, unknown>)['passwordHash'];
        const ca = ret['createdAt'];
        if (ca && typeof (ca as { toISOString?: unknown }).toISOString === 'function') {
          ret['createdAt'] = (ca as Date).toISOString();
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
