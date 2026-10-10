import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/connection';

const PORT = parseInt(process.env.PORT ?? '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/hiddenatlas';

async function bootstrap(): Promise<void> {
  // 1. Connect to MongoDB
  await connectDatabase(MONGODB_URI);

  // 2. Seed with initial data if the collection is empty
  await seedIfEmpty();
  await seedDemoUsersIfEmpty();

  // 3. Create and start Express server
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`🚀  HiddenAtlas API running on http://localhost:${PORT}`);
    console.log(`📚  Docs: http://localhost:${PORT}/health`);
  });

  // ─── Graceful Shutdown ───────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚡  ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    console.error('💥  Uncaught Exception:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('💥  Unhandled Rejection:', reason);
    process.exit(1);
  });
}

/**
 * Seeds the database with the initial mock dataset on first run.
 * Only runs when the `places` collection is completely empty.
 */
async function seedIfEmpty(): Promise<void> {
  const { PlaceModel } = await import('./infrastructure/database/PlaceModel');
  const count = await PlaceModel.countDocuments();
  if (count > 0) {
    console.log(`📦  Database already has ${count} places — skipping seed`);
    return;
  }

  console.log('🌱  Seeding database with initial places...');
  const { SEED_PLACES } = await import('./infrastructure/database/seed');
  await PlaceModel.insertMany(SEED_PLACES);
  console.log(`✅  Seeded ${SEED_PLACES.length} places successfully`);
}

/**
 * Seeds three demo explorer accounts on first run.
 * All demo accounts share the password `demo1234`.
 * Only runs when the `users` collection is completely empty.
 */
async function seedDemoUsersIfEmpty(): Promise<void> {
  const { UserModel } = await import('./infrastructure/database/UserModel');
  const count = await UserModel.countDocuments();
  if (count > 0) {
    console.log(`📦  Database already has ${count} users — skipping demo seed`);
    return;
  }

  console.log('🌱  Seeding demo explorer accounts...');
  const bcrypt = await import('bcryptjs');
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  const demoUsers = [
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@explorer.org',
      passwordHash: await bcrypt.hash('demo1234', saltRounds),
      bio: 'Alpine wanderer, photographer, and chronicler of forgotten mountain chapels and coastal coves.',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'Master Explorer (Level 4)',
      contributionsCount: 14,
    },
    {
      name: 'Mateo Silva',
      email: 'mateo.silva@wanderlust.net',
      passwordHash: await bcrypt.hash('demo1234', saltRounds),
      bio: 'Coastal scout chasing secret coves, sea caves, and the best fish tacos on the Pacific edge.',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'Coastal Scout (Level 3)',
      contributionsCount: 9,
    },
    {
      name: 'Amina Kassam',
      email: 'amina.k@atlasvoyager.io',
      passwordHash: await bcrypt.hash('demo1234', saltRounds),
      bio: 'Heritage chronicler documenting ancient shrines, craft workshops, and living traditions.',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      role: 'Heritage Chronicler (Level 5)',
      contributionsCount: 21,
    },
  ];

  await UserModel.insertMany(demoUsers);
  console.log(`✅  Seeded ${demoUsers.length} demo accounts (password: demo1234)`);
}

bootstrap().catch((err: Error) => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
