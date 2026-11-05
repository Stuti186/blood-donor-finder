import { useState } from "react";

// Reads the device location, with manual fields as a fallback.
export default function LocationPicker({ value, onChange, label = "Location" }) {
  const [msg, setMsg] = useState("");
  const detect = () => {
    if (!navigator.geolocation) return setMsg("This browser can't share your location. Enter it below.");
    setMsg("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (p) => { onChange({ lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) }); setMsg("Location set."); },
      () => setMsg("Location access was blocked. Enter coordinates below.")
    );
  };
  return (
    <fieldset className="loc">
      <legend>{label}</legend>
      <button type="button" className="btn ghost small" onClick={detect}>Use my current location</button>
      <div className="row">
        <input placeholder="Latitude" value={value.lat} onChange={(e) => onChange({ ...value, lat: e.target.value })} />
        <input placeholder="Longitude" value={value.lng} onChange={(e) => onChange({ ...value, lng: e.target.value })} />
      </div>
      {msg && <small>{msg}</small>}
    </fieldset>
  );
}
