const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const uploadDirectory = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    callback(null, `${Date.now()}-${baseName || "hotel-image"}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  }
});

app.use("/uploads", express.static(uploadDirectory));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "hotel_db",
  password: "Admin",
  port: 5432
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL connected successfully");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Express server is running");
});

app.get("/hotels", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels");

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error"
    });
  }
});

app.get("/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Hotel not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

app.post("/hotels", upload.single("image"), async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const file = req.file;

  if (!title || !description || !latitude || !longitude || !price || !file) {
    if (file) fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Hotel details and an image are required" });
  }

  const imagePath = `/uploads/${file.filename}`;

  try {
    const result = await pool.query(
      `INSERT INTO hotels
                (title, description, latitude, longitude, price, image)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (file) fs.unlink(file.path, () => { });
    console.error(error);
    res.status(500).json({ error: "Could not save hotel" });
  }
});

app.put("/hotels/:id", upload.single("image"), async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const file = req.file;

  if (!title || !description || !latitude || !longitude || !price) {
    if (file) fs.unlink(file.path, () => { });
    return res.status(400).json({ error: "Hotel details are required" });
  }

  try {
    const values = [
      title.trim(),
      description.trim(),
      latitude,
      longitude,
      price
    ];
    const imageClause = file ? ", image = $6" : "";
    if (file) {
      values.push(`/uploads/${file.filename}`);
    }

    const result = await pool.query(
      `UPDATE hotels
             SET title = $1, description = $2, latitude = $3, longitude = $4,
                 price = $5${imageClause}
             WHERE id = $${file ? 7 : 6}
             RETURNING *`,
      [...values, req.params.id]
    );

    if (!result.rowCount) {
      if (file) fs.unlink(file.path, () => { });
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (file) fs.unlink(file.path, () => { });
    console.error(error);
    res.status(500).json({ error: "Could not update hotel" });
  }
});

app.delete("/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM hotels WHERE id = $1 RETURNING id",
      [req.params.id]
    )

    if (!result.rowCount) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete hotel" });
  }
});