import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="brand"><span className="drop" />Blood Finder</Link>
        <nav>
          <NavLink to="/banks">Blood banks</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
{user?.role === "requester" && <NavLink to="/request/new">Request blood</NavLink>}
          {user ? (
            <button className="link" onClick={() => { logout(); nav("/"); }}>Log out</button>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn small">Join as donor</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
