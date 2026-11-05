import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import LocationPicker from "../components/LocationPicker.jsx";

export default function NewRequest() {
  const [f, setF] = useState({ patientName: "", bloodGroup: "O+", units: 1, hospital: "", urgency: "critical", contactPhone: "" });
  const [loc, setLoc] = useState({ lat: "", lng: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/requests", { ...f, ...loc });
      nav(`/request/${data.request._id}`);
    } catch (e) { setErr(errMsg(e)); }
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Request blood</h2>
      {err && <p className="err">{err}</p>}
      <label>Patient name<input required value={f.patientName} onChange={set("patientName")} /></label>
      <div className="row">
        <label>Blood group needed
          <select value={f.bloodGroup} onChange={set("bloodGroup")}>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label>Units<input type="number" min="1" max="10" value={f.units} onChange={set("units")} /></label>
      </div>
      <label>Hospital name<input required value={f.hospital} onChange={set("hospital")} /></label>
      <label>How urgent?
        <select value={f.urgency} onChange={set("urgency")}>
          <option value="critical">Critical</option><option value="within24h">Within 24 hours</option><option value="planned">Planned</option>
        </select>
      </label>
      <label>Contact number<input required pattern="[0-9]{10}" title="10-digit mobile number" value={f.contactPhone} onChange={set("contactPhone")} /></label>
      <LocationPicker value={loc} onChange={setLoc} label="Hospital location" />
      <button className="btn">Alert nearby donors</button>
    </form>
  );
}
