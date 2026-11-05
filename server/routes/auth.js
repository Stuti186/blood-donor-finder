import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role, bloodGroup, gender, city, lat, lng } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ message: "Fill in all required fields." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    if (await User.findOne({ email })) return res.status(409).json({ message: "This email is already registered." });
    const userRole = role === "donor" ? "donor" : "requester"; // admins are never self-registered
    if (userRole === "donor" && (!bloodGroup || !gender || lat == null || lng == null))
      return res.status(400).json({ message: "Donors must give blood group, gender and location." });

    const user = await User.create({ name, email, phone, role: userRole, password: await bcrypt.hash(password, 10) });
    if (userRole === "donor")
      await Donor.create({ user: user._id, bloodGroup, gender, city, location: { type: "Point", coordinates: [+lng, +lat] } });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, name, email, role: userRole } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
  if (user.isBanned) return res.status(403).json({ message: "This account has been suspended." });
  res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email, role: user.role } });
});

router.get("/me", protect, (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }));
export default router;
