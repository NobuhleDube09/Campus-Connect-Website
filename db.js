// db.js
const sql = require("mssql");

const config = {
    user: "sa",
    password: "CampusConnect2026!",
    server: "DESKTOP-3D29LS2",
    database: "CampusConnectDB",
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    }
};

let pool = null;

async function getConnection() {
    try {
        if (!pool) {
            console.log("🔄 Connecting to SQL Server...");
            pool = await new sql.ConnectionPool(config).connect();
            console.log("✅ Connected to SQL Server Database");
        }
        return pool;
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
        throw err;
    }
}

module.exports = { getConnection, sql };