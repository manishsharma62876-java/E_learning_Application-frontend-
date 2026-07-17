import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API from "../services/api";

const Login = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });


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


    console.log(
      "Login Response:",
      response.data
    );


    // Store JWT Token

    localStorage.setItem(
      "token",
      response.data.token
    );


    // Store user role if backend sends it

    if(response.data.role){

      localStorage.setItem(
        "role",
        response.data.role
      );

    }


    alert("Login Successful");


    navigate("/home");


  } catch(error){


    console.log(
      "Login Error:",
      error
    );


    alert(
      "Invalid Email or Password"
    );


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