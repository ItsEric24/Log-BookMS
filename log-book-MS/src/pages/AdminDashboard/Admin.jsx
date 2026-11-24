import { Link, Outlet} from "react-router";
import "./Admin.css";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FaBook } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { useAppContext } from "../../app/useAppContext";

function Admin() {
  const navigate = useNavigate();
  const { logout, token, user } = useAppContext();


  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li><MdOutlineSpaceDashboard/><Link to="/admin">Home</Link></li>
          <li><FaBook/><Link to="/admin/logbooks">Manage Logbooks</Link></li>
          <li onClick={handleLogout}><IoIosLogOut/>Logout</li>
        </ul>
      </div>
      <div className="admin-dashboard-main">
        <Header role="supervisor"/>
        <Outlet/>
      </div>
    </div>
  );
}

export default Admin;
