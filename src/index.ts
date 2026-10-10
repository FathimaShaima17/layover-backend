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

bootstrap().catch((err: Error) => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
