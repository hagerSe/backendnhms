const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // your MySQL password
  database: "NHMS",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to NHMS database");
});

// Root route
app.get("/", (req, res) => {
  res.send("NHMS Backend is Running...");
});

// Add new patient
app.post("/patients", (req, res) => {
  const data = req.body;

  const query = `
    INSERT INTO patients 
    (userid, firstName, lastName, sex, age, phone, kebele, wereda, zone, region, hospitalName, servicePlace)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      data.userid,
      data.firstName,
      data.lastName,
      data.sex,
      data.age,
      data.phone,
      data.kebele,
      data.wereda,
      data.zone,
      data.region,
      data.hospitalName,
      data.servicePlace,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Patient added", patientId: result.insertId });
    }
  );
});

// Get all patients
app.get("/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// =========================
//  VITAL SIGNS ENDPOINTS
// =========================

// GET vitals (all or by specific userid)
app.get("/vital_signs", (req, res) => {
  const userid = req.query.userid; // optional

  let sql = `
    SELECT userid, firstName, lastName, vitals, measured_at
    FROM vital_signs
  `;
  let params = [];

  if (userid) {
    sql += " WHERE userid = ? ORDER BY measured_at DESC";
    params.push(userid);
  } else {
    sql += " ORDER BY measured_at DESC";
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching vitals:", err);
      return res.status(500).json({ error: err.message });
    }

    // Parse JSON vitals correctly
    const parsedResults = results.map(row => ({
      ...row,
      vitals:
        typeof row.vitals === "string"
          ? JSON.parse(row.vitals)
          : row.vitals,
    }));

    res.json(parsedResults);
  });
});


// POST — Save vitals for a patient
app.post("/vital_signs", (req, res) => {
  const { userid, firstName, lastName, vitals } = req.body;

  if (!userid || !firstName || !lastName || !vitals) {
    return res.status(400).json({
      error: "userid, firstName, lastName, and vitals are required",
    });
  }

  const sql = `
    INSERT INTO vital_signs (userid, firstName, lastName, vitals)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userid, firstName, lastName, JSON.stringify(vitals)],
    (err, result) => {
      if (err) {
        console.error("Error inserting vitals:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Vitals saved successfully",
        savedVital: {
          userid,
          firstName,
          lastName,
          vitals,
          measured_at: new Date(),
        },
      });
    }
  );
});



// Start server (must be LAST)
app.listen(5000, () => console.log("Server running on port 5000"));
