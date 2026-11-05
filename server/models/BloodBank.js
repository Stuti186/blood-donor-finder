import mongoose from "mongoose";
const bankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  stock: [{ bloodGroup: String, units: { type: Number, default: 0 } }],
  stockUpdatedAt: { type: Date, default: Date.now },
});
bankSchema.index({ location: "2dsphere" });
export default mongoose.model("BloodBank", bankSchema);
