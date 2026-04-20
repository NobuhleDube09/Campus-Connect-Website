const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// ===== CORS MIDDLEWARE =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== POSTGRESQL DATABASE CONNECTION =====
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://campusadmin:Z0fF9lAOagrJn8xHXs2NZ5YYptSFmDe4@dpg-d7ieh0m7r5hc73c8kcc0-a:5432/campusconnectdb_pcwk",
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Database connection error:", err.message);
    } else {
        console.log("✅ Connected to PostgreSQL Database");
        release();
    }
});

// ===== TEST ENDPOINTS =====
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", dbConnected: true });
});

app.get("/health", (req, res) => {
    res.json({ 
        status: 'OK', 
        dbConnected: true,
        timestamp: new Date().toISOString()
    });
});

// ===== CREATE TABLES IF NOT EXISTS =====
async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS serviceseekers (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(100) NOT NULL,
                surname VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                passwordhash VARCHAR(255) NOT NULL,
                serviceneeded TEXT,
                studentnumber VARCHAR(50)
            )
        `);
        console.log("✅ ServiceSeekers table ready");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS serviceproviders (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(100) NOT NULL,
                surname VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                studentnumber VARCHAR(50),
                passwordhash VARCHAR(255) NOT NULL,
                servicetype VARCHAR(100),
                bio TEXT,
                hourlyrate DECIMAL(10,2),
                campus VARCHAR(100),
                availability VARCHAR(200),
                rating DECIMAL(3,2) DEFAULT 0
            )
        `);
        console.log("✅ ServiceProviders table ready");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                seekerid INTEGER REFERENCES serviceseekers(id),
                providerid INTEGER REFERENCES serviceproviders(id),
                servicedate TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Pending',
                createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Bookings table ready");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

createTables();

// ===== SIGNUP ENDPOINT (Service Seeker) =====
app.post("/signup", async (req, res) => {
    const { fullName, surname, email, password, servicesNeeded, studentNumber } = req.body;
    
    if (!fullName || !surname || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    try {
        const checkUser = await pool.query(
            "SELECT * FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            `INSERT INTO serviceseekers (fullname, surname, email, passwordhash, serviceneeded, studentnumber) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [fullName, surname, email, hashedPassword, servicesNeeded || null, studentNumber || null]
        );
        
        res.json({ success: true, message: "Sign-up successful!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== LOGIN ENDPOINT =====
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT * FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.passwordhash);
        
        if (passwordMatch) {
            res.json({ 
                success: true, 
                message: "Login successful!", 
                user: {
                    id: user.id,
                    fullName: user.fullname,
                    surname: user.surname,
                    email: user.email,
                    servicesNeeded: user.serviceneeded,
                    studentNumber: user.studentnumber
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// ===== GET USER BY EMAIL =====
app.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, studentnumber, serviceneeded FROM serviceseekers WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
});

// ===== GET ALL PROVIDERS =====
app.get("/providers", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, servicetype, bio, rating, campus, availability, hourlyrate FROM serviceproviders"
        );
        res.json({ success: true, providers: result.rows });
    } catch (err) {
        console.error("Error fetching providers:", err);
        res.status(500).json({ success: false, message: "Failed to fetch providers" });
    }
});

// ===== GET PROVIDER BY EMAIL =====
app.get("/provider/:email", async (req, res) => {
    const { email } = req.params;
    
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, studentnumber, servicetype, bio, hourlyrate, campus, availability, rating FROM serviceproviders WHERE email = $1",
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }
        
        res.json({ success: true, provider: result.rows[0] });
    } catch (err) {
        console.error("Error fetching provider:", err);
        res.status(500).json({ success: false, message: "Failed to fetch provider" });
    }
});

// ===== PROVIDER SIGNUP =====
app.post("/provider/signup", async (req, res) => {
    const { fullName, surname, email, studentNumber, password, serviceType, bio, hourlyRate, campus, availability } = req.body;
    
    if (!fullName || !surname || !email || !password || !serviceType) {
        return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }
    
    try {
        const checkUser = await pool.query(
            "SELECT * FROM serviceproviders WHERE email = $1",
            [email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Provider already exists with this email" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            `INSERT INTO serviceproviders (fullname, surname, email, studentnumber, passwordhash, servicetype, bio, hourlyrate, campus, availability, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)`,
            [fullName, surname, email, studentNumber || null, hashedPassword, serviceType, bio || null, hourlyRate || null, campus || null, availability || null]
        );
        
        res.json({ success: true, message: "Service provider signup successful!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== UPDATE PROVIDER PROFILE =====
app.put("/provider/update", async (req, res) => {
    const { email, fullName, surname, bio, hourlyRate, campus, availability } = req.body;
    
    try {
        await pool.query(
            `UPDATE serviceproviders 
             SET fullname = $1, surname = $2, bio = $3, hourlyrate = $4, campus = $5, availability = $6
             WHERE email = $7`,
            [fullName, surname, bio || null, hourlyRate || null, campus || null, availability || null, email]
        );
        
        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (err) {
        console.error("Error updating provider:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== GET ALL USERS =====
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, fullname, surname, email, serviceneeded, studentnumber FROM serviceseekers"
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
});

// ===== GET PROVIDER SERVICES =====
app.get("/provider-services/:email", async (req, res) => {
    const { email } = req.params;
    
    try {
        const result = await pool.query(
            "SELECT id, servicetype, bio, hourlyrate, campus, availability, rating FROM serviceproviders WHERE email = $1",
            [email]
        );
        
        res.json({ success: true, services: result.rows });
    } catch (err) {
        console.error("Error fetching provider services:", err);
        res.status(500).json({ success: false, message: "Failed to fetch services" });
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 Test: GET /test`);
    console.log(`📝 Signup: POST /signup`);
    console.log(`📝 Login: POST /login`);
    console.log(`📝 Providers: GET /providers`);
    console.log(`📝 Provider Services: GET /provider-services/:email`);
});