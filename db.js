const { Pool } = require("pg");
require("dotenv").config();

// Parse the CA certificate from the string provided by Aiven
const caCert = `-----BEGIN CERTIFICATE-----
MIIETTCCArWgAwIBAgIUHEs1SXKSclM6wH8mb0iniO2lg+gwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1MjZlMjZjZDUtMzFkOC00MTM0LTkwMTktZDdlNzllYzM1
NWJmIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwMjA1MDk0MTM0WhcNMzUwMjAzMDk0
MTM0WjBAMT4wPAYDVQQDDDUyNmUyNmNkNS0zMWQ4LTQxMzQtOTAxOS1kN2U3OWVj
MzU1YmYgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAMAXJAZ6SVo+JOusSvXwgE1hLmb7S1hLQ4chGxHehB9gjPDRRlwn4KvI
YwdkUWecdlbXOuIeY7HPEOVaFlHj26XtLbtrvvbQKEqIamoIfnMmlRO5GozzrduV
cAN4soqkHSjwPNbObz37XMo34yYMpFbvaMf6p3/kon5Dq+8dWqk42lGxO9BTU9LS
BgQcBFcZq7PS9/WiKDqMYKOAOABspjfws4MyPJuVgSodmvZtYcPbqMtOdrJjPWBr
UtIUqscBxyfoVHrlaZFtFs8CquIxioD/kU/9436QH8mU8yVysMDnQD55D46sIERM
pFdHho/+vYjdZrMlzvfWUOk/mUjcdX7yyjm1XiHLrbzm2G/Y8bZ2Jm3OTSTpXopC
7eK3xS6jNKoYzvSy7cxqcnVHazQE9fFLEIpfMJ7WvmDa8xPWgIU6FXvSSfrwfaYX
Ash5b3php/mm2qcmYchcxOn8Q5MyI2bu1kOypxhTfcRc/wBKIxCXHGBPzGFSPkaa
Sl317epj/QIDAQABoz8wPTAdBgNVHQ4EFgQUFout0cdfTEDasIp4EwHGM3CFaz0w
DwYDVR0TBAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGB
AJNsI+ck4D+2pJndPsEljLaVF5FQdStOEwR51CZUyUeRICIbVrVdIgbTjiyipqEm
iOS2QY98IVTR9oeApuQ6tlN6pByAJReNu+qVuAOGsOnYrZODIOjBQV023jIoJYnE
+J4EpEJE4RE0Ym6hvSnirMONH9eN3+PYRli8Ig3vPfAsIt4DImhbI4tCbWPoCwfa
HDgqDzpM0lYSKkhmGrOOl8tq8w3yoEl94J7h4SKDorIbyYz6tXJ8IpgYyavvTGBX
XeGJYzo+PvHXG0+1f5Dm/15AVNWxaARXo7aVabkCgspO0svhqAtNfYHpZYAO5xpV
E0KYHUnVF8ADtKYdvHBh7zGc02WivVN2vZNTj5g8oi997nfFrvLw9nf+emx7lsqa
fofA+odpOtr3onUhh5rJyyCFg0+nFRuIlTLCGI7aKPTwddvxs5LzvEVb1jI3uIyG
P1dAdmG8dtJ5llmAccbOeeR1qqPLsg35wWahpfbS+PxvEORy9LrTf5CM7b455Kuh
Pw==
-----END CERTIFICATE-----`;

// Database connection configuration
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true, // Enable SSL certificate validation
    ca: caCert, // Use the CA certificate provided by Aiven
  },
};

// Create a new Pool instance
const pool = new Pool(poolConfig);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err.message);
    return;
  }
  console.log("Database connected successfully");
  release();
});

// Create tables
const createTables = async () => {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

  const projectsTableQuery = `
    CREATE TABLE IF NOT EXISTS projects (
      project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_name VARCHAR(255) NOT NULL,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, project_name)
    );`;

  const tasksTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_name VARCHAR(255) NOT NULL,
      task_tags VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR[],
      task_desc TEXT,
      date TIMESTAMP WITH TIME ZONE,
      coming_from VARCHAR(255),
      is_in_progress BOOLEAN DEFAULT FALSE,
      is_complete BOOLEAN DEFAULT FALSE,
      moved_to VARCHAR(255),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE
    );`;

  const reportQuery = `
    CREATE TABLE IF NOT EXISTS reports (
      report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      date DATE NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, date)
    );`;

  try {
    await pool.query(usersTableQuery);
    console.log("Users table created successfully.");

    await pool.query(projectsTableQuery);
    console.log("Projects table created successfully.");

    await pool.query(tasksTableQuery);
    console.log("Tasks table created successfully.");

    await pool.query(reportQuery);
    console.log("Reports table created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  }
};

// Initialize tables at startup
createTables();

module.exports = pool;
