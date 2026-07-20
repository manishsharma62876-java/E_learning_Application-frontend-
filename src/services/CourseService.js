import API from "./api";

// ==========================
// Get All Courses
// ==========================
const getAllCourses = async () => {
  try {
    const response = await API.get("/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

// ==========================
// Get Course By Id
// ==========================
const getCourseById = async (id) => {
  try {
    const response = await API.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

// ==========================
// Add Course (ADMIN)
// ==========================
const addCourse = async (courseData) => {
  try {
    const response = await API.post("/courses/add", courseData);
    return response.data;
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

// ==========================
// Update Course (ADMIN)
// ==========================
const updateCourse = async (id, courseData) => {
  try {
    const response = await API.put(`/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// ==========================
// Delete Course (ADMIN)
// ==========================
const deleteCourse = async (id) => {
  try {
    const response = await API.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export default {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
};