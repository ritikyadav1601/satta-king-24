import mongoose from "mongoose";

// Extra games database (EXTRA_GAMES_MONGODB_URI) — same "games" + "gameresults"
// shape as the main DB, filled by the Satta King Fast scraper cron.
let cached = global.extraGamesConnection;

if (!cached) {
  cached = global.extraGamesConnection = { conn: null, promise: null };
}

export function hasExtraGamesMongo() {
  return Boolean(process.env.EXTRA_GAMES_MONGODB_URI);
}

export async function connectExtraGamesDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.EXTRA_GAMES_MONGODB_URI) {
    throw new Error("Missing EXTRA_GAMES_MONGODB_URI in environment.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(process.env.EXTRA_GAMES_MONGODB_URI, {
        bufferCommands: false,
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000
      })
      .asPromise()
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getExtraGamesModels(connection) {
  const Game =
    connection.models.Game ||
    connection.model(
      "Game",
      new mongoose.Schema(
        {
          name: String,
          code: String,
          resultTime: String,
          isActive: Boolean,
          showIndex: Number
        },
        { collection: "games", timestamps: true, strict: false }
      )
    );

  const GameResult =
    connection.models.GameResult ||
    connection.model(
      "GameResult",
      new mongoose.Schema(
        {
          game: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
          resultDate: String,
          result: String
        },
        { collection: "gameresults", timestamps: true, strict: false }
      )
    );

  return { Game, GameResult };
}
