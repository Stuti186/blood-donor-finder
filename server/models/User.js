import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["donor", "requester", "admin"], default: "requester" },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
