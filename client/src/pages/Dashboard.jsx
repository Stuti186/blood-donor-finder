import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === "donor") return <DonorView />;
  if (user.role === "admin") return <p>Open the <Link to="/admin">admin panel</Link>.</p>;
  return <RequesterView />;
}

function DonorView() {
  const [me, setMe] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    try {
      setMe((await api.get("/donors/me")).data);
      setInbox((await api.get("/requests/incoming")).data);
    } catch (e) { setErr(errMsg(e)); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const toggle = async () => setMe((await api.put("/donors/me", { isAvailable: !me.isAvailable })).data);
  const donated = async () => {
    if (confirm("Record that you donated today? You'll be hidden from searches until you're eligible again.")) setMe((await api.post("/donors/me/donated")).data);
  };
  const respond = async (id, status) => { await api.patch(`/requests/respond/${id}`, { status }); load(); };

  if (!me) return <p>{err || "Loading..."}</p>;
  return (
    <>
      <h2>Your donor profile</h2>
      <div className="card">
        <p><span className="chip ok big">{me.bloodGroup}</span> {me.city}</p>
        <p>Status: <b>{me.isAvailable ? "Available to donate" : "Not available"}</b>
          {!me.eligible && " (still in the waiting period after your last donation)"}</p>
        <p>Donations recorded: {me.donationCount}{me.lastDonationDate && `, last on ${new Date(me.lastDonationDate).toLocaleDateString()}`}</p>
        <div className="cta">
          <button className="btn small" onClick={toggle}>{me.isAvailable ? "Pause alerts" : "Resume alerts"}</button>
          <button className="btn ghost small" onClick={donated}>I donated today</button>
        </div>
      </div>

      <h2>Requests near you</h2>
      {inbox.length === 0 && <p className="muted">No requests right now. You'll get an email and SMS when someone nearby needs {me.bloodGroup}-compatible blood.</p>}
      {inbox.map((r) => (
        <div className={"card urg-" + r.request.urgency} key={r._id}>
          <p><b>{r.request.bloodGroup}</b> needed at {r.request.hospital} &middot; {r.request.units} unit(s) &middot; {label(r.request.urgency)}</p>
          {r.status === "notified" && (
            <div className="cta">
              <button className="btn small" onClick={() => respond(r._id, "accepted")}>Accept</button>
              <button className="btn ghost small" onClick={() => respond(r._id, "declined")}>Decline</button>
            </div>
          )}
          {r.status === "accepted" && <p className="ok-text">You accepted. Contact: {r.request.contactPhone} ({r.request.patientName})</p>}
          {r.status === "declined" && <p className="muted">You declined this request.</p>}
        </div>
      ))}
    </>
  );
}

const label = (u) => ({ critical: "Critical", within24h: "Within 24 hours", planned: "Planned" }[u]);

function RequesterView() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/requests/mine").then((r) => setList(r.data)); }, []);
  return (
    <>
      <div className="between"><h2>Your requests</h2><Link to="/request/new" className="btn small">New request</Link></div>
      {list.length === 0 && <p className="muted">You haven't posted a request yet.</p>}
      {list.map((r) => (
        <Link to={`/request/${r._id}`} className={"card block urg-" + r.urgency} key={r._id}>
          <b>{r.bloodGroup}</b> for {r.patientName} at {r.hospital}
          <span className="muted"> {r.counts.accepted} accepted of {r.counts.notified} alerted &middot; {r.status}</span>
        </Link>
      ))}
    </>
  );
}
