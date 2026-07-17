import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CourseList from "./pages/CourseList";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* Authentication */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home */}

        <Route path="/home" element={<Home />} />

        {/* Course Module */}

        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetails />} />

        {/* Student */}

        <Route path="/my-courses" element={<MyCourses />} />

      </Routes>
    </>
  );
}

export default App;