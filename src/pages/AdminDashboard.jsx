import React, { useEffect, useState, useContext, useMemo } from "react";
import { 
  FaBook, 
  FaUserGraduate, 
  FaClipboardList, 
  FaAward,
  FaEdit, 
  FaTrashAlt, 
  FaPlus,
  FaRedo,
  FaChartBar,
  FaUserCheck,
  FaKey,
  FaCertificate,
  FaCheck
} from "react-icons/fa";
import API from "../services/api";
import CourseService from "../services/CourseService";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "courses", "students"
  
  // Stats
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [totalCertificatesCount, setTotalCertificatesCount] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    duration: "",
    fees: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Quick Action Certificate Grant state
  const [certGrantData, setCertGrantData] = useState({
    email: "",
    courseId: ""
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Get Courses
      const courseData = await CourseService.getAllCourses();
      setCourses(courseData);

      // 2. Get Enrollments (Restricted to ADMIN)
      const enrollResponse = await API.get("/enrollments/all", { headers });
      setEnrollments(enrollResponse.data);

      // 3. Get Student accounts (Restricted to ADMIN)
      const studentResponse = await API.get("/admin/students", { headers });
      setStudents(studentResponse.data);

      // 4. Calculate Stats
      const uniqueActive = new Set(enrollResponse.data.map(e => e.studentEmail.toLowerCase()));
      setActiveStudentsCount(uniqueActive.size);
      
      const totalStudents = studentResponse.data.length;
      setTotalStudentsCount(totalStudents);

      // Calculate Total Certificates: Count keys in localStorage where progress is 100%
      let certsCount = 0;
      studentResponse.data.forEach(st => {
        courseData.forEach(c => {
          const key = `mock_progress_${st.email}_${c.id}`;
          const progressVal = localStorage.getItem(key);
          if (progressVal) {
            const list = JSON.parse(progressVal);
            // Default syllabus lecture count: 4
            if (list.length >= 4) {
              certsCount++;
            }
          }
        });
      });
      setTotalCertificatesCount(certsCount);

    } catch (error) {
      console.error("Error loading admin dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      category: "",
      duration: "",
      fees: ""
    });
    setIsEditing(false);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.fees) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await API.put(`/courses/${formData.id}`, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          duration: formData.duration,
          fees: Number(formData.fees)
        }, { headers });
        alert("Course updated successfully!");
      } else {
        await API.post("/courses/add", {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          duration: formData.duration,
          fees: Number(formData.fees)
        }, { headers });
        alert("Course published successfully!");
      }

      resetForm();
      loadDashboardData();
    } catch (err) {
      console.error("Error saving course:", err);
      alert("Course save operation failed.");
    }
  };

  const handleEditClick = (course) => {
    setFormData({
      id: course.id,
      title: course.title,
      description: course.description || "",
      category: course.category || "",
      duration: course.duration || "",
      fees: course.fees || ""
    });
    setIsEditing(true);
    setActiveTab("courses");
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course? This deletes the course and associated enrollments.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Course deleted successfully.");
      
      if (formData.id === id) {
        resetForm();
      }
      loadDashboardData();
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Delete operation failed.");
    }
  };

  const handleDeleteStudent = async (email) => {
    if (!window.confirm(`Are you sure you want to delete student ${email}? All enrollments and progress logs will be wiped.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/students/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Student deleted successfully.");
      loadDashboardData();
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student.");
    }
  };

  const handleGrantCertificate = (e) => {
    e.preventDefault();
    const { email, courseId } = certGrantData;
    if (!email || !courseId) {
      alert("Please fill in email and course ID.");
      return;
    }

    // Set mock progress to 100% by adding indices [0, 1, 2, 3] to localstorage progress key
    const key = `mock_progress_${email}_${courseId}`;
    localStorage.setItem(key, JSON.stringify([0, 1, 2, 3]));
    alert(`Granted Completion Certificate to ${email}!`);
    setCertGrantData({ email: "", courseId: "" });
    loadDashboardData();
  };

  // Get enrollment count per course for graph
  const getCoursePerformanceData = () => {
    return courses.map(c => {
      const count = enrollments.filter(e => parseInt(e.courseId) === parseInt(c.id)).length;
      return {
        title: c.title,
        count
      };
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="ad-loading">
          <div className="ad-loading-spinner"></div>
          Loading Admin Control Center...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="ad-inner">

        {/* ─── HEADER BANNER ─── */}
        <div className="ad-header">
          <div className="ad-header-left">
            <span className="ad-badge-label">
              Control Center
            </span>
            <h1 className="ad-header-title">Admin Dashboard</h1>
            <p className="ad-header-subtitle">
              Manage student registrations, courses roster, track credentials, and run operations.
            </p>
          </div>
          <div className="ad-header-right">
            <FaKey className="ad-header-key-icon" />
            <div>
              <span className="ad-header-email-label">Logged In as</span>
              <span className="ad-header-email">{user?.email || "admin123@gmail.com"}</span>
            </div>
          </div>
        </div>

        {/* ─── NAVIGATION TABS ─── */}
        <div className="ad-tabs">
          <button
            className={`ad-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartBar /> Overview Analytics
          </button>
          <button
            className={`ad-tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <FaBook /> Manage Courses
          </button>
          <button
            className={`ad-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <FaUserGraduate /> Manage Students
          </button>
          <button
            className="ad-tab-refresh"
            onClick={loadDashboardData}
            title="Refresh Data"
          >
            <FaRedo />
          </button>
        </div>

        {/* ════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="ad-stats-grid">
              <div className="ad-stat-card purple">
                <span className="ad-stat-label">Total Students</span>
                <div className="ad-stat-bottom">
                  <span className="ad-stat-value">{totalStudentsCount}</span>
                  <FaUserGraduate className="ad-stat-icon" />
                </div>
              </div>

              <div className="ad-stat-card indigo">
                <span className="ad-stat-label">Total Courses</span>
                <div className="ad-stat-bottom">
                  <span className="ad-stat-value">{courses.length}</span>
                  <FaBook className="ad-stat-icon" />
                </div>
              </div>

              <div className="ad-stat-card teal">
                <span className="ad-stat-label">Active Students</span>
                <div className="ad-stat-bottom">
                  <span className="ad-stat-value">{activeStudentsCount}</span>
                  <FaUserCheck className="ad-stat-icon" />
                </div>
              </div>

              <div className="ad-stat-card yellow">
                <span className="ad-stat-label">Total Certificates</span>
                <div className="ad-stat-bottom">
                  <span className="ad-stat-value">{totalCertificatesCount}</span>
                  <FaAward className="ad-stat-icon" />
                </div>
              </div>

              <div className="ad-stat-card pink">
                <span className="ad-stat-label">Total Enrollments</span>
                <div className="ad-stat-bottom">
                  <span className="ad-stat-value">{enrollments.length}</span>
                  <FaClipboardList className="ad-stat-icon" />
                </div>
              </div>
            </div>

            {/* Analytics Row */}
            <div className="ad-analytics-row">

              {/* Course Performance Chart */}
              <div className="ad-card">
                <h3 className="ad-card-title">Course Performance (Enrollments)</h3>
                <div className="ad-perf-list">
                  {getCoursePerformanceData().map((item, index) => {
                    const maxVal = Math.max(...getCoursePerformanceData().map(i => i.count), 1);
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={index} className="ad-perf-item">
                        <div className="ad-perf-meta">
                          <span className="ad-perf-name">{item.title}</span>
                          <span className="ad-perf-count">{item.count} Enrolled</span>
                        </div>
                        <div className="ad-perf-track">
                          <div className="ad-perf-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Operations */}
              <div className="ad-card">
                <div className="ad-quick-ops">
                  <p className="ad-quick-ops-title">Quick Operations</p>

                  {/* Grant Certificate Form */}
                  <form onSubmit={handleGrantCertificate} className="ad-grant-form">
                    <span className="ad-grant-label">
                      <FaCertificate /> Quick Grant Certificate
                    </span>
                    <input
                      type="email"
                      placeholder="Student Email"
                      className="ad-form-input"
                      value={certGrantData.email}
                      onChange={(e) => setCertGrantData({ ...certGrantData, email: e.target.value })}
                      required
                    />
                    <select
                      className="ad-form-select"
                      value={certGrantData.courseId}
                      onChange={(e) => setCertGrantData({ ...certGrantData, courseId: e.target.value })}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button type="submit" className="ad-btn-grant">
                      Grant Certificate
                    </button>
                  </form>

                  {/* Quick Action Buttons */}
                  <div className="ad-quick-actions-grid">
                    <button
                      className="ad-quick-action-btn"
                      onClick={() => { setActiveTab("courses"); setIsEditing(false); }}
                    >
                      <FaPlus /> Add Course
                    </button>
                    <button
                      className="ad-quick-action-btn"
                      onClick={() => setActiveTab("students")}
                    >
                      <FaUserGraduate /> Manage Users
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="ad-recent-section">
              <div className="ad-card">
                <div className="ad-table-header">
                  <h2>Recent Registrations</h2>
                </div>
                <div className="ad-table-scroll">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Registered Email</th>
                        <th>Assigned Role</th>
                        <th>Registry Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(-5).reverse().map((st, idx) => {
                        const isEnrolled = enrollments.some(e => e.studentEmail.toLowerCase() === st.email.toLowerCase());
                        return (
                          <tr key={idx}>
                            <td className="ad-cell-bold">{st.name}</td>
                            <td>{st.email}</td>
                            <td><span className="ad-tag ad-tag-purple">STUDENT</span></td>
                            <td>
                              {isEnrolled
                                ? <span className="ad-enrolled-yes">Enrolled</span>
                                : <span className="ad-enrolled-no">No Enrollments</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan="4" className="ad-table-empty">
                            No students registered in the system database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            MANAGE COURSES TAB
        ════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <div className="ad-courses-layout">

            {/* Courses Table */}
            <div className="ad-card">
              <div className="ad-table-header">
                <h2>Courses Table</h2>
              </div>
              <div className="ad-table-scroll">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Category</th>
                      <th>Instructor</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td className="ad-cell-bold">{course.title}</td>
                        <td><span className="ad-tag ad-tag-purple">{course.category}</span></td>
                        <td style={{ color: "var(--ad-muted)" }}>Dr. S. Sharma</td>
                        <td>{course.duration}</td>
                        <td className="ad-price">₹{course.fees.toLocaleString()}</td>
                        <td><span className="ad-tag ad-tag-active">Active</span></td>
                        <td>
                          <div className="ad-action-group">
                            <button
                              className="ad-btn-icon ad-btn-edit"
                              onClick={() => handleEditClick(course)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="ad-btn-icon ad-btn-delete"
                              onClick={() => handleDeleteClick(course.id)}
                              title="Delete"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="7" className="ad-table-empty">
                          No courses published in the platform directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add / Edit Form */}
            <div className="ad-form-card">
              <h2 className="ad-form-card-title">
                {isEditing ? <FaEdit /> : <FaPlus />}
                {isEditing ? "Modify Course Info" : "Add Course"}
              </h2>
              <form onSubmit={handleSubmitCourse} className="ad-course-form">
                <div>
                  <label className="ad-field-label">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="ad-input"
                    placeholder="e.g. Masterclass React API"
                    required
                  />
                </div>

                <div>
                  <label className="ad-field-label">Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="ad-input"
                    placeholder="e.g. Frontend Development"
                    required
                  />
                </div>

                <div className="ad-field-row">
                  <div>
                    <label className="ad-field-label">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="ad-input"
                      placeholder="e.g. 3 Months"
                    />
                  </div>
                  <div>
                    <label className="ad-field-label">Fees (INR) *</label>
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleInputChange}
                      className="ad-input"
                      placeholder="Amount in ₹"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="ad-field-label">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="ad-textarea"
                    placeholder="Insert curriculum description or syllabus..."
                  />
                </div>

                <div className="ad-form-actions">
                  {isEditing && (
                    <button type="button" className="ad-btn-cancel" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="ad-btn-submit">
                    {isEditing ? "Save Changes" : "Publish Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            MANAGE STUDENTS TAB
        ════════════════════════════════════════ */}
        {activeTab === "students" && (
          <div className="ad-card">
            <div className="ad-table-header">
              <h2>Students Table</h2>
            </div>
            <div className="ad-table-scroll">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student Email</th>
                    <th>Assigned Role</th>
                    <th style={{ textAlign: "center" }}>Active Courses Joined</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, index) => {
                    const joinedCount = enrollments.filter(e => e.studentEmail.toLowerCase() === st.email.toLowerCase()).length;
                    return (
                      <tr key={index}>
                        <td className="ad-cell-bold">{st.name}</td>
                        <td style={{ color: "var(--ad-muted)" }}>{st.email}</td>
                        <td><span className="ad-tag ad-tag-purple">STUDENT</span></td>
                        <td style={{ textAlign: "center" }}>
                          <span className="ad-enrolled-count">{joinedCount}</span>
                        </td>
                        <td>
                          <div className="ad-action-group">
                            <button
                              className="ad-btn-icon ad-btn-delete"
                              onClick={() => handleDeleteStudent(st.email)}
                              title="Delete Student Profile"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" className="ad-table-empty">
                        No students are registered on the platform roster registry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
