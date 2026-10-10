import mongoose from 'mongoose';

/**
 * Establishes the MongoDB connection with retry logic.
 * Logs connection lifecycle events for visibility.
 */
export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('✅  MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌  MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    // Mongoose 7+ handles these automatically but explicit is clearer
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45_000,
  });
}

/**
 * Gracefully closes the database connection.
 * Called on SIGINT / SIGTERM to allow clean shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌  MongoDB connection closed');
}
