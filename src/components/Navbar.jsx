import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaShieldAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(undefined);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed.");
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <FaShieldAlt />
        <span>SafeRoute BD</span>
      </div>

      {/* Navigation Links */}
      <div className={`nav-links ${menuOpen ? "show" : ""}`}>
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
          onClick={closeMenu}
        >
          Home
        </Link>

        {/* Full Public Map Link */}
        <Link
          to="/map"
          className={location.pathname === "/map" ? "active" : ""}
          onClick={closeMenu}
        >
          Map
        </Link>

        

        <Link
          to="/reports"
          className={location.pathname === "/reports" ? "active" : ""}
          onClick={closeMenu}
        >
          Reports
        </Link>

        <Link
          to="/about"
          className={location.pathname === "/about" ? "active" : ""}
          onClick={closeMenu}
        >
          About
        </Link>

        <Link
          to="/admin"
          className={location.pathname === "/admin" ? "active" : ""}
          onClick={closeMenu}
        >
          Admin
        </Link>
      </div>

      {/* Right Side Buttons */}
      <div className="nav-actions">
        <button
          className="theme-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {currentUser ? (
          <button
            type="button"
            className="login-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="login-btn"
            onClick={closeMenu}
          >
            Login
          </Link>
        )}

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;