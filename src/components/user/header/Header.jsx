import {React} from "react";
import { Link } from "react-router-dom";
import "../../../styles/user/Navbar.css";
import { useAuth } from "../../../store/context/UserContext";

function Navbar({ onLoginClick }) {
   const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="logo">Outfit Archive</div>
      <ul className="nav-links">
        <li><Link to={"/"}>Shop</Link></li>
        <li><Link to={"/"}>Style</Link></li>
        <li><Link to={"/"}>About</Link></li>
        <li><Link to={"/"}>마이페이지</Link></li>
        <li>{!user && <span onClick={onLoginClick}>Login</span>}
            {user && <span onClick={logout}>Logout</span>}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
