import mongoose from "mongoose";
const responseSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  status: { type: String, enum: ["notified", "accepted", "declined"], default: "notified" },
  respondedAt: Date,
}, { timestamps: true });
responseSchema.index({ request: 1, donor: 1 }, { unique: true });
export default mongoose.model("Response", responseSchema);
