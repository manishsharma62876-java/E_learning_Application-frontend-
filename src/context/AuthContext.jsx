import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// Helper to extract email from mock token: "mock-jwt-token-{email}-{ROLE}"
const extractEmailFromToken = (token) => {
  if (!token) return "";
  // Format: mock-jwt-token-email@domain.com-ROLE
  // We strip prefix "mock-jwt-token-" and suffix "-ADMIN" or "-STUDENT"
  const prefix = "mock-jwt-token-";
  if (!token.startsWith(prefix)) return "";
  const rest = token.slice(prefix.length); // e.g. "admin123@gmail.com-ADMIN"
  const roleSuffixes = ["-ADMIN", "-STUDENT"];
  for (const suffix of roleSuffixes) {
    if (rest.endsWith(suffix)) {
      return rest.slice(0, rest.length - suffix.length);
    }
  }
  return rest;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication state automatically on refresh
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("userName");

    if (token && role) {
      const email = extractEmailFromToken(token);
      setUser({
        token,
        role,
        email,
        name: name || "Creative Learner"
      });
    }
    setLoading(false);
  }, []);

  const login = (token, role, name) => {
    const email = extractEmailFromToken(token);

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userName", name || "Creative Learner");

    setUser({
      token,
      role,
      email,
      name: name || "Creative Learner"
    });
  };

  const logout = () => {
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
