import cron from "node-cron";
import Request from "../models/Request.js";
import Response from "../models/Response.js";
import { matchAndNotify } from "./matcher.js";

const RADIUS_STEPS = [5, 10, 25]; // km
const WAIT_MINUTES = 15;

// Every minute: if an open request has no accepted donor after 15 minutes, widen the radius.
export function startEscalation() {
  cron.schedule("* * * * *", async () => {
    const cutoff = new Date(Date.now() - WAIT_MINUTES * 60000);
    const stale = await Request.find({
      status: "open", escalationLevel: { $lt: RADIUS_STEPS.length - 1 }, lastNotifiedAt: { $lte: cutoff },
    });
    for (const r of stale) {
      const accepted = await Response.countDocuments({ request: r._id, status: "accepted" });
      if (accepted > 0) continue;
      r.escalationLevel += 1;
      r.radiusKm = RADIUS_STEPS[r.escalationLevel];
      const n = await matchAndNotify(r);
      console.log(`Request ${r._id} widened to ${r.radiusKm} km, ${n} new donors alerted`);
    }
  });
}
