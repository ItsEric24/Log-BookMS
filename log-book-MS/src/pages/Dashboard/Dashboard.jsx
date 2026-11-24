import "./Dashboard.css"
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { Outlet } from "react-router";
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
import { useAppContext } from "../../app/useAppContext";

function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAppContext();

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
    } else if (user.role === "supervisor") {
      navigate("/admin", { replace: true });
    }
  }, [navigate, token, user]);

  if (!token || !user || user.role === "supervisor") {
    return null
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <Outlet/>
      </div>
    </div>
  );
}

export default Dashboard;
