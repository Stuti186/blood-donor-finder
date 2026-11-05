import { Router } from "express";
import Donor from "../models/Donor.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();
router.use(protect, allow("donor"));

router.get("/me", async (req, res) => {
  const donor = await Donor.findOne({ user: req.user._id });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });
  res.json({ ...donor.toObject(), eligible: donor.isEligible() });
});

router.put("/me", async (req, res) => {
  const { isAvailable, lat, lng, city } = req.body;
  const update = {};
  if (typeof isAvailable === "boolean") update.isAvailable = isAvailable;
  if (city) update.city = city;
  if (lat != null && lng != null) update.location = { type: "Point", coordinates: [+lng, +lat] };
  const donor = await Donor.findOneAndUpdate({ user: req.user._id }, update, { new: true });
  res.json({ ...donor.toObject(), eligible: donor.isEligible() });
});

// Donor records that they have just donated -> starts the cooldown period
router.post("/me/donated", async (req, res) => {
  const donor = await Donor.findOne({ user: req.user._id });
  donor.lastDonationDate = new Date();
  donor.donationCount += 1;
  donor.isAvailable = false;
  await donor.save();
  res.json({ ...donor.toObject(), eligible: donor.isEligible() });
});
export default router;
