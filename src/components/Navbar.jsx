import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getLogoRedirect = () => {
        if (!user) return "/login";
        if (user.role === "ADMIN") return "/admin-dashboard";
        return "/student-dashboard";
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to={getLogoRedirect()}>
                    E-Learning
                </Link>
            </div>

            <ul className="navbar-menu">
                <li>
                    <Link to="/home">Home</Link>
                </li>

                {!user ? (
                    <>
                        <li>
                            <Link to="/courses">Courses</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/signup">Signup</Link>
                        </li>
                    </>
                ) : user.role === "ADMIN" ? (
                    <>
                        <li>
                            <Link to="/admin-dashboard">Admin Dashboard</Link>
                        </li>
                        <li>
                            <button 
                                className="logout-btn" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/courses">Courses</Link>
                        </li>
                        <li>
                            <Link to="/student-dashboard">Dashboard</Link>
                        </li>
                        <li>
                            <button 
                                className="logout-btn" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;