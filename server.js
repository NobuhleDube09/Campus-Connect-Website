const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-3D29LS2;Database=CampusConnectDB;Trusted_Connection=yes;Encrypt=no;";

const config = {
    connectionString: connectionString,
    driver: "msnodesqlv8"
};

let pool;

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", dbConnected: pool !== null });
});

// Signup endpoint
app.post("/signup", async (req, res) => {
    const { fullName, surname, email, password, servicesNeeded, studentNumber } = req.body;
    
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    if (!fullName || !surname || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    try {
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM ServiceSeekers WHERE Email = @email");
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('surname', sql.NVarChar, surname)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('servicesNeeded', sql.NVarChar, servicesNeeded || null)
            .input('studentNumber', sql.NVarChar, studentNumber || null)
            .query(`INSERT INTO ServiceSeekers (FullName, Surname, Email, PasswordHash, ServiceNeeded, StudentNumber) VALUES (@fullName, @surname, @email, @password, @servicesNeeded, @studentNumber)`);
        
        res.json({ success: true, message: "Sign-up successful!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM ServiceSeekers WHERE Email = @email");
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
        
        if (passwordMatch) {
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
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// Get user by email endpoint
app.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT Id, FullName, Surname, Email, StudentNumber, ServiceNeeded FROM ServiceSeekers WHERE Email = @email");
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user: result.recordset[0] });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
});

// Get all providers
app.get("/providers", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        const result = await pool.request()
            .query("SELECT Id, FullName, Surname, Email, ServiceType, Bio, Rating FROM ServiceProviders");
        res.json({ success: true, providers: result.recordset });
    } catch (err) {
        console.error("Error fetching providers:", err);
        res.status(500).json({ success: false, message: "Failed to fetch providers" });
    }
});

// Get all users
app.get("/users", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        const result = await pool.request()
            .query("SELECT Id, FullName, Surname, Email, ServiceNeeded, StudentNumber FROM ServiceSeekers");
        res.json({ success: true, users: result.recordset });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test: GET http://localhost:${PORT}/test`);
    console.log(`Signup: POST http://localhost:${PORT}/signup`);
    console.log(`Login: POST http://localhost:${PORT}/login`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
});

sql.connect(config)
    .then(poolConnection => {
        pool = poolConnection;
        console.log("Connected to SQL Server");
    })
    .catch(err => {
        console.error("DB error:", err.message);
    });