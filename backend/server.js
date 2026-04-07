const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = "apollocare_secret_key_2024"; // change this in production

app.use(cors({ origin: true }));
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Satyam@2024",
  database: "hospital"
});

db.connect(err => {
  if (err) console.log("❌ DB connection failed:", err.message);
  else console.log("✅ Connected to MySQL");
});

// ─── Middleware: verify JWT token ─────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// ════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // Check if email already exists
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length > 0) return res.status(400).json({ error: "Email already registered" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: err2.message });

          // Generate token
          const token = jwt.sign(
            { id: result.insertId, name, email },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.status(201).json({
            message: "Registration successful",
            token,
            user: { id: result.insertId, name, email }
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(400).json({ error: "Invalid email or password" });

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
});

// GET current user (protected)
app.get("/me", verifyToken, (req, res) => {
  db.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  });
});

// ════════════════════════════════════════════
//  PATIENTS (protected)
// ════════════════════════════════════════════

app.get("/patients", verifyToken, (req, res) => {
  db.query("SELECT * FROM patients ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/addPatient", verifyToken, (req, res) => {
  const { name, age, gender, phone, email, bloodGroup } = req.body;
  if (!name || !age || !gender || !phone)
    return res.status(400).json({ error: "Name, age, gender and phone are required" });

  db.query(
    "INSERT INTO patients (name, age, gender, phone, email, bloodGroup) VALUES (?, ?, ?, ?, ?, ?)",
    [name, parseInt(age), gender, phone, email || "", bloodGroup || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query("SELECT * FROM patients WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

app.put("/patients/:id", verifyToken, (req, res) => {
  const { name, age, gender, phone, email, bloodGroup } = req.body;
  if (!name || !age || !gender || !phone)
    return res.status(400).json({ error: "Name, age, gender and phone are required" });

  db.query(
    "UPDATE patients SET name=?, age=?, gender=?, phone=?, email=?, bloodGroup=? WHERE id=?",
    [name, parseInt(age), gender, phone, email || "", bloodGroup || "", req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Patient not found" });
      db.query("SELECT * FROM patients WHERE id = ?", [req.params.id], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(rows[0]);
      });
    }
  );
});

app.delete("/patients/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM patients WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted", id: parseInt(req.params.id) });
  });
});

// ════════════════════════════════════════════
//  DOCTORS (protected)
// ════════════════════════════════════════════

app.get("/doctors", verifyToken, (req, res) => {
  const { search } = req.query;
  let sql = "SELECT * FROM doctors";
  let params = [];
  if (search) {
    sql += " WHERE name LIKE ? OR specialty LIKE ? OR department LIKE ?";
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  sql += " ORDER BY id DESC";
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/addDoctor", verifyToken, (req, res) => {
  const { name, specialty, department, experience, consultationFee, bio } = req.body;
  if (!name || !specialty || !department)
    return res.status(400).json({ error: "Name, specialty and department are required" });

  db.query(
    "INSERT INTO doctors (name, specialty, department, experience, consultationFee, bio) VALUES (?, ?, ?, ?, ?, ?)",
    [name, specialty, department, Number(experience) || 0, Number(consultationFee) || 0, bio || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query("SELECT * FROM doctors WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

app.put("/doctors/:id", verifyToken, (req, res) => {
  const { name, specialty, department, experience, consultationFee, bio, available } = req.body;
  if (!name || !specialty || !department)
    return res.status(400).json({ error: "Name, specialty and department are required" });

  db.query(
    "UPDATE doctors SET name=?, specialty=?, department=?, experience=?, consultationFee=?, bio=?, available=? WHERE id=?",
    [name, specialty, department, Number(experience), Number(consultationFee), bio || "", available ? 1 : 0, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Doctor not found" });
      db.query("SELECT * FROM doctors WHERE id = ?", [req.params.id], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(rows[0]);
      });
    }
  );
});

app.delete("/doctors/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM doctors WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor deleted", id: parseInt(req.params.id) });
  });
});

// ════════════════════════════════════════════
//  APPOINTMENTS (protected)
// ════════════════════════════════════════════

app.get("/appointments", verifyToken, (req, res) => {
  db.query("SELECT * FROM appointments ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/addAppointment", verifyToken, (req, res) => {
  const { patientName, doctorId, doctorName, department, date, time, notes } = req.body;
  if (!patientName || !date || !time)
    return res.status(400).json({ error: "Patient name, date and time are required" });

  db.query(
    "INSERT INTO appointments (patientName, doctorId, doctorName, department, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [patientName, doctorId || null, doctorName || "", department || "", date, time, notes || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query("SELECT * FROM appointments WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

app.patch("/appointments/:id/status", verifyToken, (req, res) => {
  const { status } = req.body;
  const allowed = ["scheduled", "completed", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

  db.query("UPDATE appointments SET status=? WHERE id=?", [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found" });
    db.query("SELECT * FROM appointments WHERE id = ?", [req.params.id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows[0]);
    });
  });
});

app.delete("/appointments/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM appointments WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted", id: parseInt(req.params.id) });
  });
});

app.get("/", (req, res) => res.send("✅ Hospital Backend Running"));

app.listen(5051, () => console.log("🚀 Server running on http://localhost:5051"));