const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgres://postgres.hlsxstssrufqzooiivyswc:Buhle_dube09.hlsxstssrufqzooiivyswc.supabase.co:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
