import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CAN_RECEIVE_FROM = {
  "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"], "B+": ["B+", "B-", "O+", "O-"], "B-": ["B-", "O-"],
  "AB+": GROUPS, "AB-": ["A-", "B-", "AB-", "O-"], "O+": ["O+", "O-"], "O-": ["O-"],
};

export default function Home() {
  const [need, setNeed] = useState("O-");
  const { user } = useAuth();
  return (
    <section className="hero">
      <h1>Find a blood donor near the hospital, in minutes.</h1>
      <p className="lead">Pick the patient's blood group to see which donors can help. Matching donors within 5 km are alerted the moment you post a request.</p>

      <div className="picker" role="group" aria-label="Patient blood group">
        {GROUPS.map((g) => (
          <button key={g} className={"tile" + (g === need ? " on" : "")} onClick={() => setNeed(g)} aria-pressed={g === need}>{g}</button>
        ))}
      </div>
      <p className="result">
        Patient needs <b>{need}</b>. Donors who can give:{" "}
        {GROUPS.map((g) => (
          <span key={g} className={"chip" + (CAN_RECEIVE_FROM[need].includes(g) ? " ok" : "")}>{g}</span>
        ))}
      </p>

      <div className="cta">
        {user?.role !== "donor" && user?.role !== "admin" && (
          <Link to={user ? "/request/new" : "/register"} className="btn">Request blood</Link>
        )}
        {!user && <Link to="/register" className="btn ghost">Register as a donor</Link>}
      </div>
      <p className="note">Blood cannot be bought or sold. This platform only connects people; screening is done by the hospital or blood bank.</p>
    </section>
  );
}
