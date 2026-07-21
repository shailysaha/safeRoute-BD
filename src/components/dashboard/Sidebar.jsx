import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaUserShield,
  FaCog,
  FaShieldAlt,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">

        <FaShieldAlt />

        <span>SafeRoute BD</span>

      </div>

      <NavLink to="/">
        <FaHome />
        Home
      </NavLink>

      <NavLink to="/map">
        <FaMapMarkedAlt />
        Map
      </NavLink>

      <NavLink to="/reports">
        <FaExclamationTriangle />
        Reports
      </NavLink>

      <NavLink to="/admin">
        <FaUserShield />
        Admin
      </NavLink>

      <NavLink to="/about">
        <FaCog />
        About
      </NavLink>
      

    </aside>
  );
}

export default Sidebar;