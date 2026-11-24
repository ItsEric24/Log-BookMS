import "./Header.css";
import UserIcon from "../../assets/user.png";
import { useAppContext } from "../../app/useAppContext";

function Header() {
  const { user } = useAppContext();
  const name = user?.role === "supervisor" ? "Admin" : user?.name || "User";
  return (
    <div className="header">
      <h1 className="header-title">Welcome, {name}</h1>
      <div className="header-actions">
        <div className="header-profile">
          <img src={UserIcon} alt="User Avatar" className="header-avatar" />
        </div>
      </div>
    </div>
  );
}

export default Header;
