import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/useAppContext";
import { FaBook } from "react-icons/fa";
import { TbSend } from "react-icons/tb";
import { IoDocumentText } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { MdOutlineSpaceDashboard } from "react-icons/md";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAppContext();
  const isAdmin = user?.role === "supervisor";
  const basePath = isAdmin ? "/admin" : "/dashboard";

  const userLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon"><FaBook /></span>
        <span className="sidebar-title">Logbook</span>
      </div>
      <p className="sidebar-section-label">Menu</p>
      <ul className="sidebar-menu">
        <li>
          <NavLink to={basePath} end className={({ isActive }) => isActive ? "active" : ""}>
            <MdOutlineSpaceDashboard /><span>Dashboard</span>
          </NavLink>
        </li>
        {isAdmin ? (
          <li>
            <NavLink to="/admin/logbooks" className={({ isActive }) => isActive ? "active" : ""}>
              <FaBook /><span>Manage Logbooks</span>
            </NavLink>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/dashboard/submit-logbook" className={({ isActive }) => isActive ? "active" : ""}>
                <TbSend /><span>Submit Logbook</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/logbooks" className={({ isActive }) => isActive ? "active" : ""}>
                <FaBook /><span>Manage Logbooks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/daily-logs" className={({ isActive }) => isActive ? "active" : ""}>
                <IoDocumentText /><span>Daily Logs</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
      <button className="sidebar-logout" type="button" onClick={userLogout}>
        <IoIosLogOut /><span>Log out</span>
      </button>
    </aside>
  );
}
