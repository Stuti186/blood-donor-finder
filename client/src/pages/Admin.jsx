import { useEffect, useState, useCallback } from "react";
import api from "../api.js";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reqs, setReqs] = useState([]);
  const load = useCallback(async () => {
    setStats((await api.get("/admin/stats")).data);
    setUsers((await api.get("/admin/users")).data);
    setReqs((await api.get("/admin/requests")).data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, body) => { await api.patch(`/admin/users/${id}`, body); load(); };
  const del = async (id) => { if (confirm("Remove this request?")) { await api.delete(`/admin/requests/${id}`); load(); } };
  if (!stats) return <p>Loading...</p>;
  return (
    <>
      <h2>Admin panel</h2>
      <div className="stats">
        <div><b>{stats.users}</b><span>users</span></div><div><b>{stats.donors}</b><span>donors</span></div>
        <div><b>{stats.requests}</b><span>requests</span></div><div><b>{stats.fulfilled}</b><span>fulfilled</span></div>
      </div>
      <p className="muted">Most requested: {stats.demand.map((d) => `${d._id} (${d.total})`).join(", ") || "no data yet"}</p>

      <h3>Users</h3>
      <div className="scroll"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Status</th><th /></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isVerified ? "Yes" : "No"}</td><td>{u.isBanned ? "Banned" : "Active"}</td>
            <td>
              <button className="link" onClick={() => patch(u._id, { isVerified: !u.isVerified })}>{u.isVerified ? "Unverify" : "Verify"}</button>{" "}
              {u.role !== "admin" && <button className="link" onClick={() => patch(u._id, { isBanned: !u.isBanned })}>{u.isBanned ? "Unban" : "Ban"}</button>}
            </td></tr>
        ))}</tbody>
      </table></div>

      <h3>Requests</h3>
      <div className="scroll"><table>
        <thead><tr><th>Group</th><th>Hospital</th><th>By</th><th>Status</th><th /></tr></thead>
        <tbody>{reqs.map((r) => (
          <tr key={r._id}><td>{r.bloodGroup}</td><td>{r.hospital}</td><td>{r.requester?.name}</td><td>{r.status}</td>
            <td><button className="link" onClick={() => del(r._id)}>Remove</button></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
