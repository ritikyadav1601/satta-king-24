import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    sqlId: { type: Number, index: true, unique: true, sparse: true },
    name: { type: String, required: true },
    code: { type: String, default: "" },
    resultTime: { type: String, default: "00:00:00" },
    isActive: { type: Boolean, default: true },
    showIndex: { type: Number, default: 0 },
    mid: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
