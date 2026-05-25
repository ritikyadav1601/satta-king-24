import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    sqlId: { type: Number, index: true, unique: true, sparse: true },
    name: { type: String, default: "" },
    contactNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
