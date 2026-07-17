import API from "./src/services/api.js";

// Mock localStorage in Node.js since the api uses it
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

async function runTests() {
  console.log("=== STARTING AUTHENTICATION & CREDENTIALS CHECK ===\n");

  // TEST 1: Register as ADMIN (Should fail/block)
  console.log("TEST 1: Attempting to register admin123@gmail.com...");
  try {
    await API.post("/auth/signup", {
      name: "Fake Admin",
      email: "admin123@gmail.com",
      password: "Admin@123"
    });
    console.error("❌ FAIL: System allowed registration of admin123@gmail.com");
  } catch (error) {
    console.log("✅ SUCCESS: Registration of admin123@gmail.com was blocked:", error.response?.data?.message || error.message);
  }

  // TEST 2: Register a valid Student
  console.log("\nTEST 2: Registering student Jane Doe...");
  try {
    const signupRes = await API.post("/auth/signup", {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "password123"
    });
    console.log("✅ SUCCESS: Registration successful:", signupRes.data.message);
  } catch (error) {
    console.error("❌ FAIL: Student registration failed:", error.response?.data?.message || error.message);
  }

  // TEST 3: Login as newly registered Student
  console.log("\nTEST 3: Logging in as Jane Doe...");
  try {
    const loginRes = await API.post("/auth/login", {
      email: "jane.doe@example.com",
      password: "password123"
    });
    console.log("✅ SUCCESS: Login successful!");
    console.log("   Role assigned:", loginRes.data.role);
    console.log("   Token received:", loginRes.data.token);
    if (loginRes.data.role === "STUDENT") {
      console.log("   --> Verified: Automatically received STUDENT role.");
    } else {
      console.error("   ❌ FAIL: Assigned role is not STUDENT");
    }
  } catch (error) {
    console.error("❌ FAIL: Student login failed:", error.response?.data?.message || error.message);
  }

  // TEST 4: Login as Predefined Admin (admin123@gmail.com / Admin@123)
  console.log("\nTEST 4: Logging in with predefined Admin credentials...");
  let adminToken = "";
  try {
    const loginRes = await API.post("/auth/login", {
      email: "admin123@gmail.com",
      password: "Admin@123"
    });
    console.log("✅ SUCCESS: Predefined Admin Login successful!");
    console.log("   Role assigned:", loginRes.data.role);
    console.log("   Token received:", loginRes.data.token);
    adminToken = loginRes.data.token;
    if (loginRes.data.role === "ADMIN") {
      console.log("   --> Verified: Admin privileges successfully granted.");
    } else {
      console.error("   ❌ FAIL: Assigned role is not ADMIN");
    }
  } catch (error) {
    console.error("❌ FAIL: Predefined Admin login failed:", error.response?.data?.message || error.message);
  }

  // TEST 5: Test Endpoint Access Control (Admin vs Student)
  console.log("\nTEST 5: Testing Route Protection on '/admin/students'...");
  
  // Try with Student token
  console.log("   a) Accessing '/admin/students' as STUDENT...");
  try {
    await API.get("/admin/students", {
      headers: { Authorization: `Bearer mock-jwt-token-jane.doe@example.com-STUDENT` }
    });
    console.error("   ❌ FAIL: Allowed STUDENT to access admin-restricted route!");
  } catch (error) {
    console.log("   ✅ SUCCESS: Route blocked with status:", error.response?.status, `(${error.response?.data?.message})`);
  }

  // Try with Admin token
  console.log("   b) Accessing '/admin/students' as ADMIN...");
  try {
    const studentsRes = await API.get("/admin/students", {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("   ✅ SUCCESS: Route accessible. Total registered students:", studentsRes.data.length);
  } catch (error) {
    console.error("   ❌ FAIL: ADMIN was blocked from admin route:", error.response?.data?.message || error.message);
  }

  console.log("\n=== AUTHENTICATION & CREDENTIALS CHECK COMPLETED ===");
}

runTests();
