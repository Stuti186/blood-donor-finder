import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api, { errMsg } from "../api.js";

export default function RequestStatus() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => api.get(`/requests/${id}`).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e))), [id]);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]); // polling every 10s

  const close = async (status) => { await api.patch(`/requests/${id}/status`, { status }); load(); };
  if (err) return <p className="err">{err}</p>;
  if (!data) return <p>Loading...</p>;
  const { request: r, counts, acceptedDonors } = data;
  return (
    <>
      <h2>{r.bloodGroup} needed at {r.hospital}</h2>
      <div className="stats">
        <div><b>{counts.notified}</b><span>donors alerted</span></div>
        <div><b>{counts.accepted}</b><span>accepted</span></div>
        <div><b>{counts.declined}</b><span>declined</span></div>
        <div><b>{r.radiusKm} km</b><span>search radius</span></div>
      </div>
      <p className="muted">Status: {r.status}. If nobody accepts within 15 minutes, the search widens to 10 km, then 25 km. This page refreshes every 10 seconds.</p>

      <h3>Donors who accepted</h3>
      {acceptedDonors.length === 0 && <p className="muted">No one has accepted yet.</p>}
      {acceptedDonors.map((d, i) => (
        <div className="card" key={i}>{d.name} ({d.bloodGroup}) &middot; <a href={`tel:${d.phone}`}>{d.phone}</a></div>
      ))}

      {r.status === "open" && (
        <div className="cta">
          <button className="btn small" onClick={() => close("fulfilled")}>Blood received</button>
          <button className="btn ghost small" onClick={() => close("closed")}>Cancel request</button>
        </div>
      )}
    </>
  );
}
