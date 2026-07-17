import React from "react";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/student-dashboard" replace />;
};

export default DashboardRedirect;
