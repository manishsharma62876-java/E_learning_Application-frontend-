import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CourseList from "./pages/CourseList";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardRedirect from "./pages/DashboardRedirect";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public/General Home */}
        <Route path="/home" element={<Home />} />

        {/* Course Module (Requires Authentication) */}
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <CourseList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:id" 
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          } 
        />

        {/* Dashboard Router Redirect */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />

        {/* Student-Only Routes */}
        <Route 
          path="/student-dashboard" 
          element={
            <RoleBasedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/my-courses" 
          element={
            <RoleBasedRoute allowedRoles={["STUDENT"]}>
              <MyCourses />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/student/*" 
          element={
            <RoleBasedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </RoleBasedRoute>
          } 
        />

        {/* Admin-Only Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <Navigate to="/admin-dashboard" replace />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          } 
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;