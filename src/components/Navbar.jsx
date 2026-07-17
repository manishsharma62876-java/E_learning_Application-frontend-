import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("token");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };


    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <Link to="/">
                    E-Learning
                </Link>
            </div>


            <ul className="navbar-menu">

                <li>
                    <Link to="/">Home</Link>
                </li>


                <li>
                    <Link to="/courses">
                        Courses
                    </Link>
                </li>


                {
                    isLoggedIn && (
                        <li>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>
                    )
                }


                {
                    !isLoggedIn ? (
                        <>
                            <li>
                                <Link to="/login">
                                    Login
                                </Link>
                            </li>


                            <li>
                                <Link to="/signup">
                                    Signup
                                </Link>
                            </li>
                        </>
                    )
                    :
                    (
                        <li>
                            <button 
                                className="logout-btn"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </li>
                    )
                }


            </ul>

        </nav>
    );
};


export default Navbar;