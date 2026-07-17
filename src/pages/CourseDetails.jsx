import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseService from "../services/CourseService";
import EnrollmentService from "../services/EnrollmentService";
import { AuthContext } from "../context/AuthContext";
import "./CourseDetails.css";

function CourseDetails(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCourse();
    }, []);

    const fetchCourse = async () => {
        try {
            const data = await CourseService.getCourseById(id);
            setCourse(data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            await EnrollmentService.enrollCourse(id);
            setMessage("Course enrolled successfully!");
        } catch (error) {
            console.log(error);
            setMessage("Enrollment failed. Please login as Student.");
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading Course Details...</h2>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="error-container">
                <h2 className="error">Course not found</h2>
                <button onClick={() => navigate("/courses")} className="retry-btn">Back to Courses</button>
            </div>
        );
    }

    return (
        <div className="course-details-container">
            <div className="course-details-card">
                <h1>{course.title}</h1>
                <p className="description">{course.description}</p>

                <div className="details">
                    <div>
                        <strong>Category:</strong>
                        <span>{course.category}</span>
                    </div>

                    <div>
                        <strong>Duration:</strong>
                        <span>{course.duration}</span>
                    </div>

                    <div>
                        <strong>Fees:</strong>
                        <span>₹{course.fees.toLocaleString()}</span>
                    </div>
                </div>

                {user?.role === "ADMIN" ? (
                    <div className="admin-notice mt-4 bg-slate-900 border border-slate-700 px-4 py-2 rounded text-sm text-yellow-400 font-semibold inline-block">
                        ⚠️ Admin Account (Enrollment Disabled)
                    </div>
                ) : (
                    <button
                        className="enroll-btn"
                        onClick={handleEnroll}
                    >
                        Enroll Now
                    </button>
                )}

                {message && (
                    <p className="message mt-4 text-purple-300 font-semibold">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default CourseDetails;