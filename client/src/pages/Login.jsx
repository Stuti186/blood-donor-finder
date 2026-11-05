import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try { login((await api.post("/auth/login", f)).data); nav("/dashboard"); }
    catch (e) { setErr(errMsg(e)); }
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Log in</h2>
      {err && <p className="err">{err}</p>}
      <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <button className="btn">Log in</button>
      <small>New here? <Link to="/register">Create an account</Link></small>
    </form>
  );
}
