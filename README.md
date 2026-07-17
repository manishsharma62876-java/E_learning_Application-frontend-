# E-Learning Platform Frontend

Welcome to the **E-Learning Platform Frontend** project. This is a premium, highly responsive single-page web application designed for students and administrators to manage professional curriculum courses, syllabus lessons, progress metrics, and issued certificates.

The application has been styled with a modern, elegant **Dark Blue theme** utilizing harmonized navy surfaces, glowing borders, active visual elements, and smooth animations.

---

## 🚀 Key Features

### 👤 Student Dashboard
* **Dynamic Workspace:** Greeting card tailored to the student's name, active registration email, and overall statistics.
* **Progress Tracking:** Interactive syllabus list displaying standard course lectures. Students can tick checkboxes to mark lecture completion.
* **Resume Learning:** A dedicated recommendations section that allows students to resume their last active course instantly.
* **Certificates:** Automated certificate generator. Once a course hits $100\%$ progress, a premium gold double-border certificate card is issued, which can be viewed or printed in-browser.
* **Recent Activities:** Real-time activity logger recording actions like course access or module completion.

### 🔑 Admin Control Center
* **Overview Analytics:** Key metric cards (Total Students, Active Users, Published Courses, Total Enrollments, Issued Credentials) styled with color-coded hover glow effects.
* **Course Performance Graph:** High-contrast horizontal progress-bar chart mapping course enrollment numbers.
* **Interactive Operations:**
  * **Quick Grant Certificate:** A utility tool to directly issue certificates to any registered student by email.
  * **Manage Courses:** Fully functional CRUD panel (Publish new courses, modify fees/details, delete courses).
  * **Manage Students:** Registry panel to inspect registered student accounts, track their enrollment count, or delete accounts if needed.

---

## 🛠️ Technology Stack
* **Build Tool:** [Vite](https://vite.dev/) (Vite Client Environment)
* **Framework:** React JS
* **Icons:** React Icons (`fa` / FontAwesome)
* **HTTP Client:** Axios (configured with mock data interception)
* **Styling:** Custom Vanilla CSS for clean layout configurations, custom scrollbars, and dark theme adjustments.

---

## 📁 Project Structure

```text
E-Learning-Front-End/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable structural components (Navbar, ProtectedRoute, etc.)
│   ├── context/            # AuthContext (authentication provider)
│   ├── pages/              # Page layouts (Login, Signup, CourseList, AdminDashboard, StudentDashboard)
│   ├── services/           # API handlers (Axios interceptor, CourseService, EnrollmentService)
│   ├── App.jsx             # Main Application router configuration
│   ├── index.css           # Global typography, color scheme variables, and scrollbar styling
│   └── main.jsx            # DOM Renderer root mount point
├── package.json            # Scripts & project dependencies
└── vite.config.js          # Vite config
```

---

## ⚙️ Running Locally

Follow these instructions to run the application on your computer.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed ($v18$ or above recommended).

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/durgashankard/E-Learning-Platform.git
cd E-Learning-Platform
npm install
```

### 3. Run the Development Server
Launch the local dev environment:
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser to view the application.

---

## 📦 Mock Database & State Management

To run completely client-side without configuring external servers, the application utilizes a **Mock Adapter** intercepting network requests:
* **Storage Location:** All database operations (adding/deleting courses, user signups, enrollments, checklist progress) are stored locally in the browser's `localStorage`.
* **Token Auth:** Login tokens follow a custom JWT token format (`mock-jwt-token-{email}-{ROLE}`).
* **Predefined Accounts:**
  * **Administrator:**
    * **Email:** `admin123@gmail.com`
    * **Password:** `Admin@123`
  * **Student (Demo):**
    * **Email:** `student@elearn.com`
    * **Password:** `student123`

---

## 🔌 Connecting to a Spring Boot Backend & MySQL Database

If you wish to replace the client-side mock storage with a real backend API:

### 1. Configure the React Client
Open [src/services/api.js](file:///c:/Users/Lenovo/Desktop/E-Learning%20Front-End/E-Learning-Front-End/src/services/api.js) and disable the `mockAdapter`:
```javascript
const API = axios.create({
    baseURL: "http://localhost:8080/api", // Port matching your local Spring Boot app
    // adapter: mockAdapter             // Comment out or remove this line
});
```

### 2. Configure Spring Boot `application.properties`
Set up your MySQL database connections inside your Spring Boot backend configuration:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/elearning_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### 3. Handle Cross-Origin Requests (CORS)
Ensure your Spring Boot controllers or global configuration class permit HTTP operations from the React host (`http://localhost:5173`):
```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```
