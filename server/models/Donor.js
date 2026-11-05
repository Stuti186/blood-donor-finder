import mongoose from "mongoose";
const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bloodGroup: { type: String, required: true, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
  gender: { type: String, enum: ["male", "female"], required: true },
  city: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  isAvailable: { type: Boolean, default: true },
  lastDonationDate: { type: Date, default: null },
  donationCount: { type: Number, default: 0 },
});
donorSchema.index({ location: "2dsphere" });
donorSchema.methods.isEligible = function () {
  if (!this.lastDonationDate) return true;
  const gapDays = this.gender === "female" ? 120 : 90;
  return Date.now() - this.lastDonationDate.getTime() >= gapDays * 86400000;
};
export default mongoose.model("Donor", donorSchema);
