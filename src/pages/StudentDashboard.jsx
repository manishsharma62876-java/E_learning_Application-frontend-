import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaGraduationCap, 
  FaBook, 
  FaClock, 
  FaAward, 
  FaPlay, 
  FaArrowLeft, 
  FaTimes, 
  FaCheckCircle,
  FaUserCircle,
  FaLightbulb,
  FaBookOpen,
  FaChartLine
} from "react-icons/fa";
import EnrollmentService from "../services/EnrollmentService";
import { AuthContext } from "../context/AuthContext";
import "./StudentDashboard.css";

const COURSE_LECTURES = {
  1: [
    { title: "Introduction to Java & JVM Architecture", duration: "18 mins" },
    { title: "Object Oriented Programming (Classes, Interfaces)", duration: "25 mins" },
    { title: "Building Spring Boot Application Controllers", duration: "32 mins" },
    { title: "MySQL Database Integration & Queries", duration: "40 mins" }
  ],
  2: [
    { title: "Spring Beans, Injecting Dependencies", duration: "22 mins" },
    { title: "Entity Mapping & Spring Data JPA", duration: "30 mins" },
    { title: "Configuring JWT Authentication Filters", duration: "35 mins" },
    { title: "Dockerizing & Microservices Deployment", duration: "45 mins" }
  ],
  3: [
    { title: "Understanding JSX, Virtual DOM & Props", duration: "15 mins" },
    { title: "Managing State with Hooks (useState, useEffect)", duration: "28 mins" },
    { title: "Adding Router Navigation Links & Params", duration: "20 mins" },
    { title: "Fetching Rest Backend APIs with Axios", duration: "30 mins" }
  ],
  4: [
    { title: "Relational Tables & Schema Settings", duration: "12 mins" },
    { title: "Querying Multiple Tables with JOINS", duration: "24 mins" },
    { title: "Subqueries, Views & Transaction Locks", duration: "28 mins" },
    { title: "Database Indexing & Queries Tuning", duration: "32 mins" }
  ]
};

const DEFAULT_LECTURES = [
  { title: "Module 1: Fundamental Concepts Overview", duration: "15 mins" },
  { title: "Module 2: Practical Exercises & Implementations", duration: "25 mins" },
  { title: "Module 3: Project Architecture Setup", duration: "30 mins" },
  { title: "Module 4: Final Testing & Deployment Guide", duration: "35 mins" }
];

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "certificates"
  
  // Classroom mode states
  const [activeCourse, setActiveCourse] = useState(null); 
  const [activeLectureIdx, setActiveLectureIdx] = useState(0);
  const [completedLectures, setCompletedLectures] = useState([]);
  
  // Certificate view state
  const [selectedCertCourse, setSelectedCertCourse] = useState(null);

  const navigate = useNavigate();
  const userEmail = user?.email || "student@elearn.com";
  const userName = user?.name || "Creative Learner";

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const response = await EnrollmentService.getMyCourses();
      setCourses(response);
    } catch (error) {
      console.error("Error Loading Dashboard Courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseProgress = (courseId) => {
    const key = `mock_progress_${userEmail}_${courseId}`;
    const progressListVal = localStorage.getItem(key);
    if (!progressListVal) return 0;
    const progressList = JSON.parse(progressListVal);
    const lectures = COURSE_LECTURES[courseId] || DEFAULT_LECTURES;
    return Math.round((progressList.length / lectures.length) * 100);
  };

  const startStudying = (course) => {
    setActiveCourse(course);
    setActiveLectureIdx(0);
    const key = `mock_progress_${userEmail}_${course.courseId}`;
    const saved = localStorage.getItem(key);
    setCompletedLectures(saved ? JSON.parse(saved) : []);
    recordActivity(`Started studying ${course.courseTitle}`);
  };

  const toggleLectureCompleted = (idx) => {
    if (!activeCourse) return;
    
    let updated;
    const isAdding = !completedLectures.includes(idx);
    if (!isAdding) {
      updated = completedLectures.filter(i => i !== idx);
    } else {
      updated = [...completedLectures, idx];
    }
    
    setCompletedLectures(updated);
    
    const key = `mock_progress_${userEmail}_${activeCourse.courseId}`;
    localStorage.setItem(key, JSON.stringify(updated));

    const lectures = COURSE_LECTURES[activeCourse.courseId] || DEFAULT_LECTURES;
    if (isAdding) {
      recordActivity(`Completed lesson: "${lectures[idx].title}" in ${activeCourse.courseTitle}`);
    }
    
    loadMyCourses();
  };

  const recordActivity = (action) => {
    const key = `activities_${userEmail}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift({
      action,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
  };

  const getRecentActivities = () => {
    const key = `activities_${userEmail}`;
    const defaultAct = [
      { action: "Registered on E-Learning Workspace", time: "10:15 AM", date: "Jul 17" },
      { action: "Accessed Dashboard", time: "10:30 AM", date: "Jul 17" }
    ];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultAct;
  };

  const courseCount = courses.length;
  const completedCount = courses.filter(c => getCourseProgress(c.courseId) === 100).length;
  const totalCompletedLecturesCount = courses.reduce((acc, c) => {
    const key = `mock_progress_${userEmail}_${c.courseId}`;
    const saved = localStorage.getItem(key);
    const completedIdxs = saved ? JSON.parse(saved) : [];
    return acc + completedIdxs.length;
  }, 0);
  const studyHours = (courseCount * 4.5 + totalCompletedLecturesCount * 1.2).toFixed(1);

  // Resume course recommendation (first course not completed)
  const resumeCourse = courses.find(c => getCourseProgress(c.courseId) < 100);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="sd-loading">
          <div className="sd-spinner"></div>
          Loading Student Profile...
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════
     CLASSROOM MODE
  ════════════════════════════════════ */
  if (activeCourse) {
    const lectures = COURSE_LECTURES[activeCourse.courseId] || DEFAULT_LECTURES;
    const currentLecture = lectures[activeLectureIdx] || lectures[0];
    const progress = Math.round((completedLectures.length / lectures.length) * 100);

    return (
      <div className="student-dashboard sd-classroom">
        <div className="sd-classroom-inner">

          {/* Back button */}
          <button className="sd-back-btn" onClick={() => setActiveCourse(null)}>
            <FaArrowLeft /> Back to Dashboard
          </button>

          {/* Classroom header */}
          <div className="sd-classroom-header">
            <div>
              <span className="sd-classroom-tag">Classroom Sandbox</span>
              <h2 className="sd-classroom-title">{activeCourse.courseTitle}</h2>
            </div>
            <div className="sd-classroom-header-right">
              <div className="sd-progress-info">
                <span>Overall Course Progress</span>
                <strong>{progress}%</strong>
              </div>
              {progress === 100 && (
                <button
                  className="sd-btn-cert-view"
                  onClick={() => setSelectedCertCourse(activeCourse)}
                >
                  🏆 View Certificate
                </button>
              )}
            </div>
          </div>

          {/* Classroom grid */}
          <div className="sd-classroom-grid">

            {/* Syllabus sidebar */}
            <div className="sd-syllabus-card">
              <h3 className="sd-syllabus-title">
                <FaBookOpen /> Syllabus Lessons
              </h3>
              <ul className="sd-syllabus-list">
                {lectures.map((lec, idx) => (
                  <li
                    key={idx}
                    className={`sd-lesson-item ${idx === activeLectureIdx ? "active" : ""}`}
                    onClick={() => setActiveLectureIdx(idx)}
                  >
                    <input
                      type="checkbox"
                      className="sd-lesson-checkbox"
                      checked={completedLectures.includes(idx)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleLectureCompleted(idx);
                      }}
                    />
                    <div className="sd-lesson-info">
                      <span className="sd-lesson-name">{idx + 1}. {lec.title}</span>
                      <span className="sd-lesson-duration">{lec.duration}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video player */}
            <div className="sd-player-card">
              {/* Simulated video */}
              <div className="sd-video-box">
                <span className="sd-video-badge">Lecture {activeLectureIdx + 1}</span>
                <FaPlay className="sd-play-icon" />
                <span className="sd-video-title">Interactive Learning Sandbox</span>
                <small className="sd-video-sub">Active Learning Mode without server lags</small>
              </div>

              {/* Lesson description */}
              <div className="sd-lesson-detail">
                <h3>{activeLectureIdx + 1}. {currentLecture.title}</h3>
                <p>
                  Welcome to the module! Fulfill your study credentials by watching this simulated lecture.
                  Once you have completed learning the concepts, click the checkbox in the lesson list to
                  record your progress and generate your credential certificate.
                </p>
              </div>

              {/* Prev / Next */}
              <div className="sd-player-nav">
                <button
                  className="sd-btn-prev"
                  disabled={activeLectureIdx === 0}
                  onClick={() => setActiveLectureIdx(prev => prev - 1)}
                >
                  Previous
                </button>
                <button
                  className="sd-btn-next"
                  disabled={activeLectureIdx === lectures.length - 1}
                  onClick={() => setActiveLectureIdx(prev => prev + 1)}
                >
                  Next Lesson
                </button>
              </div>
            </div>
          </div>

          {selectedCertCourse && renderCertModal(selectedCertCourse, () => setSelectedCertCourse(null))}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════
     MAIN DASHBOARD VIEW
  ════════════════════════════════════ */
  return (
    <div className="student-dashboard">
      <div className="sd-inner">

        {/* Welcome Banner */}
        <div className="sd-banner">
          <div className="sd-banner-left">
            <span className="sd-banner-badge">Student Workspace</span>
            <h1 className="sd-banner-title">Welcome Back, {userName}!</h1>
            <p className="sd-banner-subtitle">
              Explore your dashboard, track study metrics, access curriculum tools, and secure professional completion certificates.
            </p>
          </div>
          <div className="sd-banner-profile">
            <FaUserCircle className="sd-banner-avatar-icon" />
            <div>
              <span className="sd-banner-email-label">Registered Email</span>
              <span className="sd-banner-email">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sd-stats-grid">
          <div className="sd-stat-card purple">
            <div className="sd-stat-icon-wrap"><FaBook /></div>
            <div className="sd-stat-info">
              <span className="sd-stat-value">{courseCount}</span>
              <span className="sd-stat-label">Courses Enrolled</span>
            </div>
          </div>

          <div className="sd-stat-card indigo">
            <div className="sd-stat-icon-wrap"><FaClock /></div>
            <div className="sd-stat-info">
              <span className="sd-stat-value">{studyHours} hrs</span>
              <span className="sd-stat-label">Study Hours Logged</span>
            </div>
          </div>

          <div className="sd-stat-card teal">
            <div className="sd-stat-icon-wrap"><FaCheckCircle /></div>
            <div className="sd-stat-info">
              <span className="sd-stat-value">{totalCompletedLecturesCount}</span>
              <span className="sd-stat-label">Lectures Finished</span>
            </div>
          </div>

          <div className="sd-stat-card yellow">
            <div className="sd-stat-icon-wrap"><FaAward /></div>
            <div className="sd-stat-info">
              <span className="sd-stat-value">{completedCount}</span>
              <span className="sd-stat-label">Certificates Earned</span>
            </div>
          </div>
        </div>

        {/* Main two-column grid */}
        <div className="sd-main-grid">

          {/* LEFT COLUMN */}
          <div className="sd-left-col">

            {/* Resume card */}
            {resumeCourse && (
              <div className="sd-resume-banner">
                <div className="sd-resume-left">
                  <FaLightbulb className="sd-resume-icon" />
                  <div>
                    <span className="sd-resume-tag">Quick Resume</span>
                    <h3 className="sd-resume-title">{resumeCourse.courseTitle}</h3>
                    <p className="sd-resume-progress">
                      Current Progress: {getCourseProgress(resumeCourse.courseId)}%
                    </p>
                  </div>
                </div>
                <button
                  className="sd-btn-resume"
                  onClick={() => startStudying(resumeCourse)}
                >
                  <FaPlay style={{ fontSize: 11 }} /> Resume Learning
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="sd-card">
              <div className="sd-tabs">
                <button
                  className={`sd-tab ${activeTab === "courses" ? "active" : ""}`}
                  onClick={() => setActiveTab("courses")}
                >
                  <FaBook /> My Courses
                </button>
                <button
                  className={`sd-tab ${activeTab === "certificates" ? "active" : ""}`}
                  onClick={() => setActiveTab("certificates")}
                >
                  <FaAward /> Certificates ({completedCount})
                </button>
              </div>

              {/* COURSES TAB */}
              {activeTab === "courses" && (
                courses.length === 0 ? (
                  <div className="sd-empty">
                    <h3>No Enrolled Courses Found</h3>
                    <p>Start learning by enrolling in any programming or developer courses.</p>
                    <button className="sd-btn-browse" onClick={() => navigate("/courses")}>
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="sd-courses-grid">
                    {courses.map((course, idx) => {
                      const progress = getCourseProgress(course.courseId);
                      return (
                        <div className="sd-course-card" key={idx}>
                          <div>
                            <span className="sd-course-tag">{course.category}</span>
                            <h4 className="sd-course-title">{course.courseTitle}</h4>
                            <p className="sd-course-duration">Duration: {course.duration}</p>
                          </div>
                          <div>
                            <div className="sd-progress-label">
                              <span>Syllabus Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="sd-progress-track">
                              <div className="sd-progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <button
                              className="sd-btn-study"
                              onClick={() => startStudying(course)}
                            >
                              <FaPlay style={{ fontSize: 11 }} /> Access Syllabus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* CERTIFICATES TAB */}
              {activeTab === "certificates" && (
                completedCount === 0 ? (
                  <div className="sd-empty">
                    <h3>No Certificates Issued</h3>
                    <p>Complete 100% of standard lectures in any course to unlock your completion credentials.</p>
                  </div>
                ) : (
                  <div className="sd-cert-grid">
                    {courses.filter(c => getCourseProgress(c.courseId) === 100).map((course, idx) => (
                      <div className="sd-cert-card" key={idx}>
                        <FaAward className="sd-cert-icon" />
                        <h4 className="sd-cert-title">{course.courseTitle}</h4>
                        <p className="sd-cert-sub">Credentials Unlocked Successfully</p>
                        <button
                          className="sd-btn-cert"
                          onClick={() => setSelectedCertCourse(course)}
                        >
                          View Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="sd-right-col">

            {/* Student Profile */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <FaUserCircle /> Student Profile
              </h3>
              <ul className="sd-profile-list">
                <li className="sd-profile-item">
                  <span className="sd-profile-key">Full Name</span>
                  <span className="sd-profile-val">{userName}</span>
                </li>
                <li className="sd-profile-item">
                  <span className="sd-profile-key">Role Status</span>
                  <span className="sd-role-pill">STUDENT</span>
                </li>
                <li className="sd-profile-item">
                  <span className="sd-profile-key">Active Courses</span>
                  <span className="sd-profile-val">{courseCount}</span>
                </li>
                <li className="sd-profile-item">
                  <span className="sd-profile-key">Certificates Issued</span>
                  <span className="sd-cert-count">{completedCount}</span>
                </li>
              </ul>
            </div>

            {/* Activity Log */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <FaChartLine /> Recent Activities
              </h3>
              <ul className="sd-activity-list">
                {getRecentActivities().map((act, index) => (
                  <li className="sd-activity-item" key={index}>
                    <div>
                      <span className="sd-activity-text">{act.action}</span>
                      <span className="sd-activity-time">{act.time}</span>
                    </div>
                    <span className="sd-activity-date">{act.date}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {selectedCertCourse && renderCertModal(selectedCertCourse, () => setSelectedCertCourse(null))}
      </div>
    </div>
  );

  // ─── Certificate Modal ───
  function renderCertModal(course, onClose) {
    const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="cert-modal-overlay" onClick={onClose}>
        <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-cert-btn" onClick={onClose}><FaTimes /></button>
          
          <div className="cert-frame">
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏅</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, fontFamily: 'Georgia, serif', margin: '0 0 6px', color: '#1e293b' }}>
              CERTIFICATE OF COMPLETION
            </h1>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: '#6b7280', marginBottom: 28, fontFamily: 'Georgia, serif' }}>
              This certifies that the recipient has fulfilled curriculum requisites
            </p>
            
            <p style={{ fontSize: 10, letterSpacing: 2, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
              PROUDLY PRESENTED TO
            </p>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Georgia, serif', borderBottom: '2px solid #e2e8f0', display: 'inline-block', paddingBottom: 6, color: '#6d28d9', marginBottom: 22 }}>
              {userName}
            </div>
            
            <p style={{ fontSize: 13, color: '#4b5563', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>
              for successfully completing the E-Learning syllabus criteria, assignments, and practical sandboxes for the course
              <br />
              <strong style={{ color: '#1e293b', fontFamily: 'inherit', fontSize: 15, display: 'block', marginTop: 8 }}>{course.courseTitle}</strong>
              <span style={{ fontSize: 12, color: '#6b7280', display: 'block', marginTop: 4 }}>Total syllabus duration: {course.duration}</span>
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 22, maxWidth: 400, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', width: 140 }}>
                <span style={{ fontStyle: 'italic', fontSize: 13, color: '#1e293b', fontFamily: 'Georgia, serif' }}>Academy Director</span>
                <div style={{ fontSize: 9, color: '#9ca3af', borderTop: '1px solid #d1d5db', paddingTop: 4, marginTop: 4, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Academics Board</div>
              </div>
              <div style={{ textAlign: 'center', width: 140 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{dateStr}</span>
                <div style={{ fontSize: 9, color: '#9ca3af', borderTop: '1px solid #d1d5db', paddingTop: 4, marginTop: 4, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Date of Issuance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default StudentDashboard;
