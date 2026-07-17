import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/CourseService";
import "./CourseList.css";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "Web Development", "Data Science", "Design", "Marketing"];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [courses, searchTerm, selectedCategory, sortBy]);

  const loadCourses = async () => {
    try {
      const data = await CourseService.getAllCourses();
      setCourses(data);
      setFilteredCourses(data);
      setLoading(false);
    } catch (error) {
      setError("Unable to load courses");
      setLoading(false);
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...courses];

    // 1. Apply Search Filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
      );
    }

    // 2. Apply Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 3. Apply Sorting
    if (sortBy === "priceAsc") {
      result.sort((a, b) => a.fees - b.fees);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.fees - a.fees);
    } else if (sortBy === "durationAsc") {
      // Helper function to extract numerical weeks
      const getWeeks = (dur) => parseInt(dur.replace(/[^0-9]/g, "")) || 0;
      result.sort((a, b) => getWeeks(a.duration) - getWeeks(b.duration));
    } else if (sortBy === "durationDesc") {
      const getWeeks = (dur) => parseInt(dur.replace(/[^0-9]/g, "")) || 0;
      result.sort((a, b) => getWeeks(b.duration) - getWeeks(a.duration));
    }

    setFilteredCourses(result);
  };

  if (loading) {
    return <h2 className="loading">Loading Courses...</h2>;
  }

  if (error) {
    return <h2 className="error">{error}</h2>;
  }

  return (
    <div className="course-page">
      <div className="catalog-header">
        <h1>Explore Professional Programs</h1>
        <p className="catalog-subtitle">Build real-world expertise with structured curriculum paths led by industry professionals.</p>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="controls-panel">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by course title, topic, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-box-wrapper">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Recommended</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="durationAsc">Duration: Shortest first</option>
            <option value="durationDesc">Duration: Longest first</option>
          </select>
        </div>
      </div>

      {/* Category Tag Pills */}
      <div className="categories-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Catalog Display Grid */}
      {filteredCourses.length === 0 ? (
        <div className="empty-catalog-state">
          <h3>No courses match your criteria</h3>
          <p>Try adjusting your search terms or clearing the selected category filters.</p>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSortBy("default");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="course-container">
          {filteredCourses.map((course) => (
            <div className="course-card" key={course.id}>
              <div className="card-top">
                <span className="card-cat-tag">{course.category}</span>
                <span className="card-duration-badge">⏳ {course.duration}</span>
              </div>

              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <div className="card-bottom">
                <div className="fees-display">
                  <span className="fees-label">Tuition Fees</span>
                  <span className="fees-val">₹{course.fees.toLocaleString()}</span>
                </div>
                <button
                  className="details-link-btn"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
