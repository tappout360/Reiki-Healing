// Vercel Serverless Utility — MongoDB Connection Helper
// Reuses MongoClient connection across serverless warm invocations
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'reiki_healing';

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing. Configure it in Vercel Dashboard → Settings → Environment Variables.');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const opts = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  const client = new MongoClient(uri, opts);
  await client.connect();
  const db = client.db(dbName);

  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}
