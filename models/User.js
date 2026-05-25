import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    sqlId: { type: Number, index: true, unique: true, sparse: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
