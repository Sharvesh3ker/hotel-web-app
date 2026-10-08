const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = "postgresql://postgres:Muniyandy%400927@db.bvsxrdingflileaxbcat.supabase.co:5432/postgres";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSchema() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");
    
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    
    console.log("Executing schema...");
    await client.query(schemaSql);
    console.log("Schema executed successfully! Table 'hotels' is ready.");
    
  } catch (error) {
    console.error("Error executing schema:", error);
  } finally {
    await client.end();
  }
}

runSchema();
