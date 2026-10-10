/**
 * Environment configuration for authentication.
 * Values are read from process.env (dotenv is loaded at startup).
 */
export const jwtConfig = {
  // In production this MUST be overridden via environment variables.
  secret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
};

export const bcryptConfig = {
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
};
