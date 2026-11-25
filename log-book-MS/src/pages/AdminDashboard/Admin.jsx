import { Outlet } from "react-router";
import "./Admin.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppContext } from "../../app/useAppContext";

function Admin() {
  const navigate = useNavigate();
  const { token, user } = useAppContext();

  useEffect(() => {
    if (!token || !user || user.role !== "supervisor") {
      navigate("/login", { replace: true });
    }
  }, [navigate, token, user]);

  if (!token || !user || user.role !== "supervisor") {
    return null;
  }

  return (
    <div className="admin-dashboard-container">
      <Sidebar />
      <div className="admin-dashboard-main">
        <Header />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Admin;
