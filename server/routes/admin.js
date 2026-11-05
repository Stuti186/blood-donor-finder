import { Router } from "express";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import Request from "../models/Request.js";
import Response from "../models/Response.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();
router.use(protect, allow("admin"));

router.get("/stats", async (_req, res) => {
  const [users, donors, requests, fulfilled, accepted] = await Promise.all([
    User.countDocuments(), Donor.countDocuments(), Request.countDocuments(),
    Request.countDocuments({ status: "fulfilled" }), Response.countDocuments({ status: "accepted" }),
  ]);
  const demand = await Request.aggregate([{ $group: { _id: "$bloodGroup", total: { $sum: 1 } } }, { $sort: { total: -1 } }]);
  res.json({ users, donors, requests, fulfilled, accepted, demand });
});

router.get("/users", async (_req, res) => res.json(await User.find().select("-password").sort("-createdAt").limit(200)));
router.patch("/users/:id", async (req, res) => {
  const { isVerified, isBanned } = req.body;
  res.json(await User.findByIdAndUpdate(req.params.id, { isVerified, isBanned }, { new: true }).select("-password"));
});
router.get("/requests", async (_req, res) => res.json(await Request.find().sort("-createdAt").limit(100).populate("requester", "name email")));
router.delete("/requests/:id", async (req, res) => {
  await Request.findByIdAndDelete(req.params.id);
  await Response.deleteMany({ request: req.params.id });
  res.json({ message: "Request removed." });
});
export default router;
