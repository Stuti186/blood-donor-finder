import { Router } from "express";
import Request from "../models/Request.js";
import Response from "../models/Response.js";
import Donor from "../models/Donor.js";
import { protect, allow } from "../middleware/auth.js";
import { matchAndNotify } from "../utils/matcher.js";

const router = Router();
router.use(protect);

// Create a request and alert nearby donors
router.post("/", allow("requester"), async (req, res) => {
  try {
    const { patientName, bloodGroup, units, hospital, urgency, contactPhone, lat, lng } = req.body;
    if (!patientName || !bloodGroup || !hospital || !contactPhone || lat == null || lng == null)
      return res.status(400).json({ message: "Fill in all required fields, including the hospital location." });
    const open = await Request.countDocuments({ requester: req.user._id, status: "open" });
    if (open >= 3) return res.status(429).json({ message: "You already have 3 open requests. Close one first." });

    const request = await Request.create({
      requester: req.user._id, patientName, bloodGroup, units, hospital, urgency, contactPhone,
      location: { type: "Point", coordinates: [+lng, +lat] },
    });
    const notified = await matchAndNotify(request);
    res.status(201).json({ request, notified });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/mine", async (req, res) => {
  const requests = await Request.find({ requester: req.user._id }).sort("-createdAt").lean();
  for (const r of requests) {
    const rs = await Response.find({ request: r._id });
    r.counts = { notified: rs.length, accepted: rs.filter((x) => x.status === "accepted").length };
  }
  res.json(requests);
});

// Donor inbox: requests that alerted this donor
router.get("/incoming", allow("donor"), async (req, res) => {
  const donor = await Donor.findOne({ user: req.user._id });
  const responses = await Response.find({ donor: donor._id }).sort("-createdAt").populate("request").lean();
  res.json(responses.filter((r) => r.request && (r.request.status === "open" || r.status === "accepted")));
});

// Requester view: live status. Donor phone numbers are only revealed once a donor accepts.
router.get("/:id", async (req, res) => {
  const request = await Request.findById(req.params.id).lean();
  if (!request) return res.status(404).json({ message: "Request not found." });
  if (String(request.requester) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "You don't have access to this." });
  const responses = await Response.find({ request: request._id }).populate({ path: "donor", populate: { path: "user", select: "name phone" } });
  res.json({
    request,
    counts: { notified: responses.length, accepted: responses.filter((r) => r.status === "accepted").length, declined: responses.filter((r) => r.status === "declined").length },
    acceptedDonors: responses.filter((r) => r.status === "accepted").map((r) => ({ name: r.donor.user.name, phone: r.donor.user.phone, bloodGroup: r.donor.bloodGroup })),
  });
});

// Donor accepts or declines
router.patch("/respond/:responseId", allow("donor"), async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) return res.status(400).json({ message: "Choose accept or decline." });
  const donor = await Donor.findOne({ user: req.user._id });
  const response = await Response.findOne({ _id: req.params.responseId, donor: donor._id });
  if (!response) return res.status(404).json({ message: "Response not found." });
  response.status = status;
  response.respondedAt = new Date();
  await response.save();
  res.json(response);
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["fulfilled", "closed"].includes(status)) return res.status(400).json({ message: "Invalid status." });
  const request = await Request.findOneAndUpdate({ _id: req.params.id, requester: req.user._id }, { status }, { new: true });
  if (!request) return res.status(404).json({ message: "Request not found." });
  res.json(request);
});
export default router;
