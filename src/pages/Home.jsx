import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {

  const navigate = useNavigate();

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">

          <h1>
            Welcome to E-Learning Platform
          </h1>

          <p>
            Learn Java, Spring Boot, React, SQL and become a
            job-ready Full Stack Developer.
          </p>

          <button
            className="explore-btn"
            onClick={() => navigate("/courses")}
          >
            Explore Courses
          </button>

        </div>

      </section>

      {/* Stats Section */}

      <section className="stats">

        <div className="stat-card">
          <h2>5000+</h2>
          <p>Students</p>
        </div>

        <div className="stat-card">
          <h2>50+</h2>
          <p>Courses</p>
        </div>

        <div className="stat-card">
          <h2>20+</h2>
          <p>Expert Trainers</p>
        </div>

      </section>

      {/* Courses Section */}

      <section className="courses">

        <h2>Popular Courses</h2>

        <div className="course-container">

          <div className="course-card">
            <h3>Java Full Stack</h3>
            <p>
              Learn Core Java, Spring Boot, React, MySQL and build real projects.
            </p>
          </div>

          <div className="course-card">
            <h3>Spring Boot Masterclass</h3>
            <p>
              Build REST APIs, Security, JWT Authentication and Microservices.
            </p>
          </div>

          <div className="course-card">
            <h3>React Development</h3>
            <p>
              Learn Components, Hooks, Routing and API Integration.
            </p>
          </div>

        </div>

      </section>

      {/* Why Us */}

      <section className="why-us">

        <h2>Why Choose Us?</h2>

        <div className="why-container">

          <div className="why-card">
            <h3>Live Projects</h3>
            <p>Work on real-world projects.</p>
          </div>

          <div className="why-card">
            <h3>Expert Mentors</h3>
            <p>Industry experienced trainers.</p>
          </div>

          <div className="why-card">
            <h3>Career Support</h3>
            <p>Interview preparation and placement guidance.</p>
          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="footer">

        <p>
          © 2026 E-Learning Platform. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;