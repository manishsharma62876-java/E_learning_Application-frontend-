import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Login API Integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/auth/login",
        loginData
      );

      console.log("Login Response:", response.data);

      // Call login from Context to store JWT & User details
      login(response.data.token, response.data.role, response.data.name);

      alert("Login Successful");

      if (response.data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }

    } catch (error) {
      console.log("Login Error:", error);
      alert(error.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="login-header">
          <h1>E-Learning</h1>
          <p>Login to continue learning</p>
        </div>


        <form onSubmit={handleSubmit}>


          <div className="input-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={handleChange}
              required
            />

          </div>



          <div className="input-group">

            <label>Password</label>

            <div className="password-box">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleChange}
                required
              />


              <span
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </span>

            </div>

          </div>



          <div className="forgot">

            <a href="#">
              Forgot Password?
            </a>

          </div>



          <button 
            type="submit"
            className="login-btn"
          >
            Login
          </button>


        </form>



        <div className="signup-link">

          <p>
            Don't have an account?

            <span
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>

          </p>

        </div>


      </div>


    </div>
  );
};


export default Login;