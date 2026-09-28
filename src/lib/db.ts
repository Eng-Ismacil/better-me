import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/betterme";
const dbName = process.env.MONGODB_DB || "betterme";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    client = await global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    await client.connect();
  }

  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

let indexesInitialized = false;

export async function ensureIndexes(): Promise<void> {
  if (indexesInitialized) return;
  try {
    const { db } = await connectToDatabase();

    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("users").createIndex({ deletedAt: 1 }),
      db.collection("users").createIndex({ status: 1 }),
      db.collection("users").createIndex({ isAdmin: 1 }),
      db.collection("habits").createIndex({ userId: 1, status: 1 }),
      db.collection("habits").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("habitCompletions").createIndex(
        { userId: 1, habitId: 1, date: 1 },
        { unique: true }
      ),
      db.collection("habitCompletions").createIndex({ userId: 1, date: 1 }),
      db.collection("routines").createIndex({ userId: 1 }),
      db.collection("dailyCheckIns").createIndex(
        { userId: 1, date: 1 },
        { unique: true }
      ),
      db.collection("reminders").createIndex({ userId: 1 }),
      db.collection("userAchievements").createIndex(
        { userId: 1, achievementCode: 1 },
        { unique: true }
      ),
      db.collection("auditLogs").createIndex({ createdAt: -1 }),
      db.collection("financeTransactions").createIndex({ userId: 1, date: -1 }),
      db.collection("twoFactorCodes").createIndex({ email: 1, token: 1 }),
    ]);

    indexesInitialized = true;
  } catch (error) {
    console.error("Failed to ensure MongoDB indexes:", error);
  }
}
