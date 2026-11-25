import "./Header.css";
import UserIcon from "../../assets/user.png";
import { useAppContext } from "../../app/useAppContext";

function Header() {
  const { user } = useAppContext();
  const name = user?.name || (user?.role === "supervisor" ? "Admin" : "User");
  const role = user?.role === "supervisor" ? "Administrator" : "Student";

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Dashboard</h1>
        <p className="header-date">
          {new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </p>
      </div>
      <div className="header-actions">
        <div className="header-profile">
          <img src={UserIcon} alt="" className="header-avatar" />
          <div className="header-profile-copy">
            <span className="header-profile-name">{name}</span>
            <span className="header-profile-role">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
