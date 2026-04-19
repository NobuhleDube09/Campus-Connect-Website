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
let isConnecting = false;

// ===== DATABASE CONNECTION WITH AUTO-RECONNECT =====
async function connectToDatabase() {
    if (isConnecting) return;
    isConnecting = true;
    
    try {
        const poolConnection = await sql.connect(config);
        pool = poolConnection;
        console.log("✅ Connected to SQL Server");
        
        // Handle connection errors after successful connection
        poolConnection.on('error', (err) => {
            console.error('Database connection error:', err);
            pool = null;
            // Try to reconnect after 5 seconds
            setTimeout(() => {
                console.log('Attempting to reconnect to database...');
                connectToDatabase();
            }, 5000);
        });
        
        isConnecting = false;
    } catch (err) {
        console.error("❌ DB connection error:", err.message);
        isConnecting = false;
        // Retry connection after 10 seconds
        setTimeout(() => {
            console.log('Retrying database connection...');
            connectToDatabase();
        }, 10000);
    }
}

// ===== TEST ENDPOINTS =====
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", dbConnected: pool !== null });
});

app.get("/health", (req, res) => {
    res.json({ 
        status: 'OK', 
        dbConnected: pool !== null,
        timestamp: new Date().toISOString()
    });
});

// ===== SIGNUP ENDPOINT (Service Seeker) =====
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

// ===== LOGIN ENDPOINT =====
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

// ===== GET USER BY EMAIL =====
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

// ===== GET ALL PROVIDERS =====
app.get("/providers", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        const result = await pool.request()
            .query("SELECT Id, FullName, Surname, Email, ServiceType, Bio, Rating, Campus, Availability, HourlyRate FROM ServiceProviders");
        res.json({ success: true, providers: result.recordset });
    } catch (err) {
        console.error("Error fetching providers:", err);
        res.status(500).json({ success: false, message: "Failed to fetch providers" });
    }
});

// ===== GET ALL USERS =====
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

// ===== PROVIDER SIGNUP =====
app.post("/provider/signup", async (req, res) => {
    const { fullName, surname, email, studentNumber, password, serviceType, bio, hourlyRate, campus, availability } = req.body;
    
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    if (!fullName || !surname || !email || !password || !serviceType) {
        return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }
    
    try {
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM ServiceProviders WHERE Email = @email");
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Provider already exists with this email" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('surname', sql.NVarChar, surname)
            .input('email', sql.NVarChar, email)
            .input('studentNumber', sql.NVarChar, studentNumber || null)
            .input('password', sql.NVarChar, hashedPassword)
            .input('serviceType', sql.NVarChar, serviceType)
            .input('bio', sql.NVarChar, bio || null)
            .input('hourlyRate', sql.Decimal, hourlyRate || null)
            .input('campus', sql.NVarChar, campus || null)
            .input('availability', sql.NVarChar, availability || null)
            .query(`INSERT INTO ServiceProviders (FullName, Surname, Email, StudentNumber, PasswordHash, ServiceType, Bio, HourlyRate, Campus, Availability, Rating) 
                    VALUES (@fullName, @surname, @email, @studentNumber, @password, @serviceType, @bio, @hourlyRate, @campus, @availability, 0)`);
        
        res.json({ success: true, message: "Service provider signup successful!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== ADD SERVICE (for existing providers) =====
app.post("/add-service", async (req, res) => {
    const { providerEmail, title, category, description, price, priceType, campus, availability } = req.body;
    
    if (!pool) {
        return res.status(503).json({ success: false, message: "Database not ready" });
    }
    
    try {
        // Check if provider exists
        const checkProvider = await pool.request()
            .input('email', sql.NVarChar, providerEmail)
            .query("SELECT * FROM ServiceProviders WHERE Email = @email");
        
        if (checkProvider.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }
        
        // Update provider's service details
        await pool.request()
            .input('email', sql.NVarChar, providerEmail)
            .input('serviceType', sql.NVarChar, category)
            .input('bio', sql.NVarChar, description)
            .input('hourlyRate', sql.Decimal, price)
            .input('campus', sql.NVarChar, campus || null)
            .input('availability', sql.NVarChar, availability || null)
            .query(`UPDATE ServiceProviders 
                    SET ServiceType = @serviceType, Bio = @bio, HourlyRate = @hourlyRate, 
                        Campus = @campus, Availability = @availability
                    WHERE Email = @email`);
        
        res.json({ success: true, message: "Service published successfully!" });
    } catch (err) {
        console.error("Error adding service:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test: GET http://localhost:${PORT}/test`);
    console.log(`Signup: POST http://localhost:${PORT}/signup`);
    console.log(`Login: POST http://localhost:${PORT}/login`);
    console.log(`Providers: GET http://localhost:${PORT}/providers`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
});

// ===== INITIATE DATABASE CONNECTION =====
connectToDatabase();