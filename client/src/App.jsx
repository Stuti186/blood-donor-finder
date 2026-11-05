import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Protected from "./components/Protected.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewRequest from "./pages/NewRequest.jsx";
import RequestStatus from "./pages/RequestStatus.jsx";
import Banks from "./pages/Banks.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/banks" element={<Banks />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/request/new" element={<Protected roles={["requester"]}><NewRequest /></Protected>} />
          <Route path="/request/:id" element={<Protected><RequestStatus /></Protected>} />
          <Route path="/admin" element={<Protected roles={["admin"]}><Admin /></Protected>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
