import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import LocationPicker from "../components/LocationPicker.jsx";

export default function Register() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", role: "donor", bloodGroup: "O+", gender: "male", city: "" });
  const [loc, setLoc] = useState({ lat: "", lng: "" });
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { login((await api.post("/auth/register", { ...f, ...loc })).data); nav("/dashboard"); }
    catch (e) { setErr(errMsg(e)); }
  };
  const donor = f.role === "donor";
  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Create your account</h2>
      {err && <p className="err">{err}</p>}
      <div className="seg">
        <button type="button" className={donor ? "on" : ""} onClick={() => setF({ ...f, role: "donor" })}>I want to donate</button>
        <button type="button" className={!donor ? "on" : ""} onClick={() => setF({ ...f, role: "requester" })}>I need blood</button>
      </div>
      <label>Full name<input required value={f.name} onChange={set("name")} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set("email")} /></label>
      <label>Phone<input required pattern="[0-9]{10}" title="10-digit mobile number" value={f.phone} onChange={set("phone")} /></label>
      <label>Password<input type="password" minLength={6} required value={f.password} onChange={set("password")} /></label>
      {donor && (
        <>
          <div className="row">
            <label>Blood group
              <select value={f.bloodGroup} onChange={set("bloodGroup")}>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => <option key={g}>{g}</option>)}</select>
            </label>
            <label>Gender
              <select value={f.gender} onChange={set("gender")}><option value="male">Male</option><option value="female">Female</option></select>
            </label>
          </div>
          <label>City<input value={f.city} onChange={set("city")} /></label>
          <LocationPicker value={loc} onChange={setLoc} label="Where are you usually available?" />
        </>
      )}
      <button className="btn">Create account</button>
    </form>
  );
}
