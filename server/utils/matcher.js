import Donor from "../models/Donor.js";
import Response from "../models/Response.js";
import { CAN_RECEIVE_FROM } from "./compatibility.js";
import { sendEmail, sendSMS } from "./notify.js";

// Find eligible, compatible donors within request.radiusKm who haven't been notified yet, and alert them.
export async function matchAndNotify(request) {
  const already = await Response.find({ request: request._id }).distinct("donor");
  const donors = await Donor.find({
    _id: { $nin: already },
    user: { $ne: request.requester },
    bloodGroup: { $in: CAN_RECEIVE_FROM[request.bloodGroup] },
    isAvailable: true,
    location: { $near: { $geometry: request.location, $maxDistance: request.radiusKm * 1000 } },
  }).limit(50).populate("user", "name email phone isBanned");

  const eligible = donors.filter((d) => d.isEligible() && !d.user.isBanned);
  for (const d of eligible) {
    await Response.create({ request: request._id, donor: d._id });
    const msg = `URGENT: ${request.bloodGroup} blood needed at ${request.hospital} (${request.urgency}). Log in to Blood Finder to accept or decline.`;
    sendEmail(d.user.email, `Blood needed: ${request.bloodGroup}`, msg);
    sendSMS(d.user.phone, msg);
  }
  request.lastNotifiedAt = new Date();
  await request.save();
  return eligible.length;
}
