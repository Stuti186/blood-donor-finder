import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import api from "../api.js";

export default function Banks() {
  const [banks, setBanks] = useState([]);
  useEffect(() => { api.get("/banks").then((r) => setBanks(r.data)); }, []);
  const center = banks[0] ? [banks[0].location.coordinates[1], banks[0].location.coordinates[0]] : [26.4499, 80.3319];
  return (
    <>
      <h2>Blood banks</h2>
      <MapContainer key={center.join()} center={center} zoom={12} className="map">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {banks.map((b) => (
          <CircleMarker key={b._id} center={[b.location.coordinates[1], b.location.coordinates[0]]} radius={10} pathOptions={{ color: "#C1121F", fillOpacity: 0.8 }}>
            <Popup><b>{b.name}</b><br />{b.address}<br />{b.phone}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {banks.length === 0 && <p className="muted">No blood banks have been added yet.</p>}
      {banks.map((b) => (
        <div className="card" key={b._id}>
          <b>{b.name}</b> <span className="muted">{b.address} &middot; {b.phone}</span>
          <div className="stock">
            {b.stock.map((s) => <span key={s.bloodGroup} className={"chip" + (s.units > 0 ? " ok" : "")}>{s.bloodGroup}: {s.units}</span>)}
          </div>
          <small className="muted">Stock last updated {new Date(b.stockUpdatedAt).toLocaleString()}. Call to confirm before travelling.</small>
        </div>
      ))}
    </>
  );
}
