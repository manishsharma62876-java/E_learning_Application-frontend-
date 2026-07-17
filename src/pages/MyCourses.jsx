import React, { useEffect, useState } from "react";
import EnrollmentService from "../services/EnrollmentService";
import "./MyCourse.css";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const response = await EnrollmentService.getMyCourses();
      setCourses(response);
    } catch (error) {
      console.error("Error Loading Courses:", error);
      alert("Unable to load your enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading your courses...</h2>
      </div>
    );
  }

  return (
    <div className="mycourses-container">

      <h1 className="page-title">📚 My Enrolled Courses</h1>

      {courses.length === 0 ? (
        <div className="empty-card">
          <h2>No Courses Enrolled</h2>
          <p>Enroll in a course to start your learning journey.</p>
        </div>
      ) : (
        <div className="course-grid">

          {courses.map((course, index) => (
            <div className="course-card" key={index}>

              <h2>{course.courseTitle}</h2>

              <p>
                <strong>Category:</strong> {course.category}
              </p>

              <p>
                <strong>Duration:</strong> {course.duration}
              </p>

              <p>
                <strong>Fees:</strong> ₹{course.fees}
              </p>

              <p className="status">
                ✅ Enrolled Successfully
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default MyCourses;