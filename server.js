const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const { getConnection, sql } = require("./db");

const app = express();
const PORT = 3000;

// ===== CORS MIDDLEWARE (Moved before bodyParser for best practice) =====
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve static files (HTML, CSS, JS)

let dbPool = null;

// ===== DATABASE CONNECTION =====
getConnection()
  .then(pool => {
    dbPool = pool;
    console.log("✅ Database ready");
  })
  .catch(err => {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1); // Exit if database connection fails
  });

function getPool() {
  if (!dbPool) throw new Error("Database not connected yet");
  return dbPool;
}

// ===== TEST ENDPOINT =====
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", dbConnected: dbPool !== null });
});

// ===== CHECK TABLES ENDPOINT (Added for debugging) =====
app.get("/check-tables", async (req, res) => {
  try {
    const pool = getPool();
    const seekers = await pool.request().query("SELECT COUNT(*) as count FROM ServiceSeekers");
    const providers = await pool.request().query("SELECT COUNT(*) as count FROM ServiceProviders");
    res.json({ 
      success: true, 
      seekersCount: seekers.recordset[0].count,
      providersCount: providers.recordset[0].count 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== HOMEPAGE ROUTE =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== SIGNUP (Service Seeker) =====
app.post("/signup", async (req, res) => {
  const { fullName, surname, email, password, servicesNeeded, studentNumber } = req.body;
  if (!fullName || !surname || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const pool = getPool();
    const checkUser = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM ServiceSeekers WHERE Email = @email");

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("fullName", sql.NVarChar, fullName)
      .input("surname", sql.NVarChar, surname)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("servicesNeeded", sql.NVarChar, servicesNeeded || null)
      .input("studentNumber", sql.NVarChar, studentNumber || null)
      .query(`INSERT INTO ServiceSeekers (FullName, Surname, Email, PasswordHash, ServiceNeeded, StudentNumber) 
              VALUES (@fullName, @surname, @email, @password, @servicesNeeded, @studentNumber)`);

    res.json({ success: true, message: "Sign-up successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.message === "Database not connected yet") {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== LOGIN (Service Seeker) =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const pool = getPool(); // Fixed: using getPool() instead of dbPool directly
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM ServiceSeekers WHERE Email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.Id,
        fullName: user.FullName,
        surname: user.Surname,
        email: user.Email,
        servicesNeeded: user.ServiceNeeded,
        studentNumber: user.StudentNumber
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    if (err.message === "Database not connected yet") {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});
// ===== PROVIDER SIGNUP (Updated with monthly rate option) =====
app.post("/provider/signup", async (req, res) => {
  const { fullName, surname, email, studentNumber, password, serviceType, bio, hourlyRate, monthlyRate, campus, availability } = req.body;
  
  // Allow either hourly rate OR monthly rate
  let finalHourlyRate = hourlyRate;
  if (monthlyRate && !hourlyRate) {
    // Convert monthly to hourly (assuming 160 hours per month)
    finalHourlyRate = monthlyRate / 160;
  }
  
  if (!fullName || !surname || !email || !password || !serviceType) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  try {
    const pool = getPool();
    const checkUser = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM ServiceProviders WHERE Email = @email");

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "Provider already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("fullName", sql.NVarChar, fullName)
      .input("surname", sql.NVarChar, surname)
      .input("email", sql.NVarChar, email)
      .input("studentNumber", sql.NVarChar, studentNumber || null)
      .input("password", sql.NVarChar, hashedPassword)
      .input("serviceType", sql.NVarChar, serviceType)
      .input("bio", sql.NVarChar, bio || null)
      .input("hourlyRate", sql.Decimal, finalHourlyRate || null)
      .input("campus", sql.NVarChar, campus || null)
      .input("availability", sql.NVarChar, availability || null)
      .query(`INSERT INTO ServiceProviders (FullName, Surname, Email, StudentNumber, PasswordHash, ServiceType, Bio, HourlyRate, Campus, Availability, Rating) 
              VALUES (@fullName, @surname, @email, @studentNumber, @password, @serviceType, @bio, @hourlyRate, @campus, @availability, 0)`);
    res.json({ success: true, message: "Service provider signup successful!" });
  } catch (err) {
    console.error("Provider signup error:", err);
    if (err.message === "Database not connected yet") {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== PROVIDER LOGIN =====
app.post("/provider/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const pool = getPool(); // Fixed: using getPool() instead of dbPool directly
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM ServiceProviders WHERE Email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const provider = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, provider.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful!",
      provider: {
        id: provider.Id,
        fullName: provider.FullName,
        surname: provider.Surname,
        email: provider.Email,
        serviceType: provider.ServiceType
      }
    });
  } catch (err) {
    console.error("Provider login error:", err);
    if (err.message === "Database not connected yet") {
      return res.status(503).json({ success: false, message: "Database is connecting, please try again" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== GET ALL PROVIDERS =====
// ===== GET ALL PROVIDERS (Updated with monthly rate) =====
app.get("/providers", async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .query(`SELECT 
        Id, 
        FullName, 
        Surname, 
        Email, 
        ServiceType, 
        Bio, 
        Rating, 
        Campus, 
        Availability, 
        HourlyRate,
        -- Calculate monthly rate (assuming 20 working days * 8 hours)
        (HourlyRate * 8 * 20) as MonthlyRate
        FROM ServiceProviders`);
    
    res.json({ success: true, providers: result.recordset });
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Test: GET http://localhost:${PORT}/test`);
  console.log(`📝 Check Tables: GET http://localhost:${PORT}/check-tables`);
  console.log(`📝 Signup: POST http://localhost:${PORT}/signup`);
  console.log(`📝 Login: POST http://localhost:${PORT}/login`);
  console.log(`📝 Provider Signup: POST http://localhost:${PORT}/provider/signup`);
  console.log(`📝 Provider Login: POST http://localhost:${PORT}/provider/login`);
  console.log(`📝 Providers: GET http://localhost:${PORT}/providers`);
  console.log(`🌐 Homepage: http://localhost:${PORT}/`);
});