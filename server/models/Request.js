import mongoose from "mongoose";
const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
  units: { type: Number, default: 1, min: 1, max: 10 },
  hospital: { type: String, required: true },
  urgency: { type: String, enum: ["critical", "within24h", "planned"], default: "within24h" },
  contactPhone: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  status: { type: String, enum: ["open", "fulfilled", "closed"], default: "open" },
  radiusKm: { type: Number, default: 5 },
  escalationLevel: { type: Number, default: 0 },
  lastNotifiedAt: { type: Date, default: Date.now },
}, { timestamps: true });
requestSchema.index({ location: "2dsphere" });
export default mongoose.model("Request", requestSchema);
