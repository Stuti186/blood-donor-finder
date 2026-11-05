import { Router } from "express";
import BloodBank from "../models/BloodBank.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();

// Public: list banks, optionally sorted by distance (?lat=..&lng=..&km=..)
router.get("/", async (req, res) => {
  const { lat, lng, km } = req.query;
  const q = lat && lng
    ? { location: { $near: { $geometry: { type: "Point", coordinates: [+lng, +lat] }, $maxDistance: (+km || 50) * 1000 } } }
    : {};
  res.json(await BloodBank.find(q).limit(100));
});

router.post("/", protect, allow("admin"), async (req, res) => {
  const { name, address, phone, lat, lng } = req.body;
  const bank = await BloodBank.create({ name, address, phone, location: { type: "Point", coordinates: [+lng, +lat] } });
  res.status(201).json(bank);
});

router.put("/:id/stock", protect, allow("admin"), async (req, res) => {
  const bank = await BloodBank.findByIdAndUpdate(req.params.id, { stock: req.body.stock, stockUpdatedAt: new Date() }, { new: true });
  res.json(bank);
});
export default router;
