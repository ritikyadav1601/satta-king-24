import mongoose from "mongoose";

const GameResultSchema = new mongoose.Schema(
  {
    sqlId: { type: Number, index: true, unique: true, sparse: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    gameSqlId: { type: Number, index: true },
    resultDate: { type: String, required: true, index: true },
    result: { type: String, default: "" }
  },
  { timestamps: true }
);

GameResultSchema.index({ game: 1, resultDate: 1 }, { unique: true });

export default mongoose.models.GameResult || mongoose.model("GameResult", GameResultSchema);
