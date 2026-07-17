import axios from "axios";

// Helper to simulate network latency
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract email and role from mock token: "mock-jwt-token-{email}-{ROLE}"
const parseToken = (token) => {
    if (!token) return { email: "", role: "" };
    const prefix = "mock-jwt-token-";
    if (!token.startsWith(prefix)) return { email: "", role: "" };
    const rest = token.slice(prefix.length); // e.g. "admin123@gmail.com-ADMIN"
    const roleSuffixes = ["ADMIN", "STUDENT"];
    for (const role of roleSuffixes) {
        if (rest.endsWith("-" + role)) {
            return { email: rest.slice(0, rest.length - role.length - 1), role };
        }
    }
    return { email: rest, role: "" };
};

// Retrieve or initialize localStorage tables
const getMockTable = (key, defaultVal = []) => {
    const val = localStorage.getItem(key);
    if (!val) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
    }
    return JSON.parse(val);
};

const saveMockTable = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize default courses
const INITIAL_COURSES = [
    {
        id: 1,
        title: "Java Full Stack Development",
        description: "Learn Core Java, Advanced Java, Spring Boot, React, and SQL with real-world projects and placement support.",
        category: "Software Development",
        duration: "6 Months",
        fees: 25000
    },
    {
        id: 2,
        title: "Spring Boot Masterclass",
        description: "Master REST APIs, Spring Security, JWT authentication, Spring Data JPA, and Microservices architecture.",
        category: "Backend Development",
        duration: "3 Months",
        fees: 15000
    },
    {
        id: 3,
        title: "React JS & Modern Frontend",
        description: "Build high-performance UI components, master hooks, state management (Redux/Context), and API integration.",
        category: "Frontend Development",
        duration: "2 Months",
        fees: 12000
    },
    {
        id: 4,
        title: "SQL & Database Design",
        description: "Learn relational databases, complex queries, indexing, query optimization, and normalization in MySQL and PostgreSQL.",
        category: "Database Engineering",
        duration: "1.5 Months",
        fees: 8000
    }
];

const mockAdapter = async (config) => {
    await sleep(200); // Simulate network speed

    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    const data = config.data ? JSON.parse(config.data) : null;

    // Auth token extraction
    const authHeader = config.headers ? (config.headers.Authorization || config.headers.authorization) : null;
    const token = authHeader ? authHeader.replace("Bearer ", "").trim() : null;

    let responseData = null;
    let status = 200;

    try {
        // Router for endpoints

        // 1. SIGNUP
        if (url.endsWith("/auth/signup") && method === "post") {
            const users = getMockTable("mock_users");
            const { name, email, password } = data;

            // Block admin registration
            if (email.toLowerCase() === "admin123@gmail.com") {
                throw { status: 400, message: "Admin registration is not allowed" };
            }

            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                throw { status: 400, message: "Email already registered" };
            }

            // Force role to STUDENT
            users.push({ name, email, password, role: "STUDENT" });
            saveMockTable("mock_users", users);

            responseData = { message: "Registration successful" };
            status = 201;
        }

        // 2. LOGIN
        else if (url.endsWith("/auth/login") && method === "post") {
            const users = getMockTable("mock_users");
            const { email, password } = data;

            let user;
            // Validate predefined Admin account
            if (email.toLowerCase() === "admin123@gmail.com" && password === "Admin@123") {
                user = { name: "System Admin", email: "admin123@gmail.com", role: "ADMIN" };
            } else {
                user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

                // Fallback default student login
                if (!user && email === "student@elearn.com" && password === "student123") {
                    user = { name: "Default Student", email: "student@elearn.com", role: "STUDENT" };
                }
            }

            if (!user) {
                throw { status: 400, message: "Invalid Email or Password" };
            }

            responseData = {
                token: `mock-jwt-token-${user.email}-${user.role}`,
                role: user.role,
                name: user.name
            };
            status = 200;
        }

        // 3. COURSES MODULE (GET ALL, POST ADD)
        else if (url.endsWith("/courses") && method === "get") {
            responseData = getMockTable("mock_courses", INITIAL_COURSES);
            status = 200;
        }

        else if (url.endsWith("/courses") && method === "post") {
            // Admin Add Course
            const courses = getMockTable("mock_courses", INITIAL_COURSES);
            const { title, description, category, duration, fees } = data;
            const newCourse = {
                id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
                title,
                description,
                category,
                duration,
                fees: Number(fees) || 0
            };
            courses.push(newCourse);
            saveMockTable("mock_courses", courses);

            responseData = newCourse;
            status = 201;
        }

        // 4. COURSE DETAILS GET/PUT/DELETE
        else if (/\/courses\/\d+$/.test(url)) {
            const courses = getMockTable("mock_courses", INITIAL_COURSES);
            const id = parseInt(url.split("/").pop());
            const courseIdx = courses.findIndex(c => c.id === id);

            if (courseIdx === -1) {
                throw { status: 404, message: "Course not found" };
            }

            if (method === "get") {
                responseData = courses[courseIdx];
                status = 200;
            } else if (method === "put") {
                const { title, description, category, duration, fees } = data;
                courses[courseIdx] = {
                    ...courses[courseIdx],
                    title,
                    description,
                    category,
                    duration,
                    fees: Number(fees) || courses[courseIdx].fees
                };
                saveMockTable("mock_courses", courses);
                responseData = courses[courseIdx];
                status = 200;
            } else if (method === "delete") {
                const deleted = courses.splice(courseIdx, 1);
                saveMockTable("mock_courses", courses);

                // Cleanup enrollments
                const enrollments = getMockTable("mock_enrollments");
                const filteredEnrollments = enrollments.filter(e => parseInt(e.courseId) !== id);
                saveMockTable("mock_enrollments", filteredEnrollments);

                responseData = { message: "Course deleted successfully", course: deleted[0] };
                status = 200;
            }
        }

        // 5. ENROLLMENTS - ADD ENROLLMENT
        else if (url.endsWith("/enrollments/add") && method === "post") {
            if (!token) {
                throw { status: 401, message: "Unauthorized" };
            }

            const { email } = parseToken(token);
            const { courseId } = data;
            const enrollments = getMockTable("mock_enrollments");

            const alreadyExists = enrollments.some(e => e.email === email && parseInt(e.courseId) === parseInt(courseId));

            if (alreadyExists) {
                responseData = { message: "Already enrolled in this course" };
                status = 200;
            } else {
                enrollments.push({ email, courseId: parseInt(courseId) });
                saveMockTable("mock_enrollments", enrollments);
                responseData = { message: "Enrolled successfully" };
                status = 201;
            }
        }

        // 6. ENROLLMENTS - GET MY COURSES
        else if (url.endsWith("/enrollments/my-courses") && method === "get") {
            if (!token) {
                throw { status: 401, message: "Unauthorized" };
            }
            const { email } = parseToken(token);
            const enrollments = getMockTable("mock_enrollments");
            const courses = getMockTable("mock_courses", INITIAL_COURSES);

            const myEnrollments = enrollments.filter(e => e.email === email);
            const myEnrolledCourses = myEnrollments.map(e => {
                const course = courses.find(c => c.id === parseInt(e.courseId));
                if (!course) return null;
                return {
                    courseTitle: course.title,
                    category: course.category,
                    duration: course.duration,
                    fees: course.fees,
                    courseId: course.id
                };
            }).filter(Boolean);

            responseData = myEnrolledCourses;
            status = 200;
        }

        // 7. ENROLLMENTS - GET ALL ENROLLMENTS (ADMIN RESTRICTED)
        else if (url.endsWith("/enrollments/all") && method === "get") {
            const { role: tokenRole } = parseToken(token);
            if (!token || tokenRole !== "ADMIN") {
                throw { status: 403, message: "Forbidden" };
            }
            const enrollments = getMockTable("mock_enrollments");
            const courses = getMockTable("mock_courses", INITIAL_COURSES);
            const users = getMockTable("mock_users");

            const detailedEnrollments = enrollments.map(e => {
                const course = courses.find(c => c.id === parseInt(e.courseId));
                const user = users.find(u => u.email === e.email) || { name: "Default Student", email: e.email };
                return {
                    studentName: user.name,
                    studentEmail: user.email,
                    courseId: e.courseId,
                    courseTitle: course ? course.title : "Unknown Course",
                    category: course ? course.category : ""
                };
            });
            responseData = detailedEnrollments;
            status = 200;
        }

        // 8. ADMIN - GET ALL STUDENTS (ADMIN RESTRICTED)
        else if (url.endsWith("/admin/students") && method === "get") {
            const { role: tokenRole } = parseToken(token);
            if (!token || tokenRole !== "ADMIN") {
                throw { status: 403, message: "Forbidden" };
            }
            const users = getMockTable("mock_users");
            const students = users.filter(u => u.role === "STUDENT");
            responseData = students;
            status = 200;
        }

        // 9. ADMIN - DELETE STUDENT (ADMIN RESTRICTED)
        else if (url.includes("/admin/students/") && method === "delete") {
            const { role: tokenRole } = parseToken(token);
            if (!token || tokenRole !== "ADMIN") {
                throw { status: 403, message: "Forbidden" };
            }
            const emailToDelete = decodeURIComponent(url.split("/").pop());
            const users = getMockTable("mock_users");
            const updated = users.filter(u => u.email.toLowerCase() !== emailToDelete.toLowerCase());
            saveMockTable("mock_users", updated);

            // Clean up enrollments for this email
            const enrollments = getMockTable("mock_enrollments");
            const filteredEnrollments = enrollments.filter(e => e.email.toLowerCase() !== emailToDelete.toLowerCase());
            saveMockTable("mock_enrollments", filteredEnrollments);

            responseData = { message: "Student deleted successfully" };
            status = 200;
        }

        else {
            throw { status: 404, message: "Endpoint mock not found" };
        }

        return {
            data: responseData,
            status: status,
            statusText: status === 200 || status === 201 ? "OK" : "Error",
            headers: {},
            config: config
        };

    } catch (err) {
        const errResponse = {
            data: { message: err.message || "Request failed" },
            status: err.status || 500,
            statusText: "Error",
            headers: {},
            config: config
        };
        const error = new Error(err.message || "Axios mock error");
        error.response = errResponse;
        throw error;
    }
};

const API = axios.create({
    baseURL: "http://localhost:8080/api",
    adapter: mockAdapter
});

export default API;