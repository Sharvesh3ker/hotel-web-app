require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Setup Supabase Client for Storage
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Use Memory Storage for Vercel Serverless Functions
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Admin@localhost:5432/hotel_db",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL connected successfully");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

app.get("/api", (req, res) => {
  res.send("Express API is running");
});

app.get("/api/hotels", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Hotel not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/hotels", upload.single("image"), async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const file = req.file;

  if (!title || !description || !latitude || !longitude || !price || !file) {
    return res.status(400).json({ error: "Hotel details and an image are required" });
  }

  let imagePath = null;

  try {
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "")}`;
    const { data, error } = await supabase.storage
      .from("hotels")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("hotels").getPublicUrl(fileName);
    imagePath = publicUrlData.publicUrl;

    const result = await pool.query(
      `INSERT INTO hotels (title, description, latitude, longitude, price, image)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save hotel" });
  }
});

app.put("/api/hotels/:id", upload.single("image"), async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const file = req.file;

  if (!title || !description || !latitude || !longitude || !price) {
    return res.status(400).json({ error: "Hotel details are required" });
  }

  try {
    let oldImage = null;
    const oldHotel = await pool.query("SELECT image FROM hotels WHERE id = $1", [req.params.id]);
    if (oldHotel.rowCount) oldImage = oldHotel.rows[0].image;

    const values = [title.trim(), description.trim(), latitude, longitude, price];
    let imageClause = "";

    if (file) {
      const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "")}`;
      const { data, error } = await supabase.storage
        .from("hotels")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("hotels").getPublicUrl(fileName);
      values.push(publicUrlData.publicUrl);
      imageClause = ", image = $6";

      if (oldImage && oldImage.includes('supabase.co')) {
        const oldFileName = oldImage.split('/').pop();
        await supabase.storage.from("hotels").remove([oldFileName]);
      }
    }

    const result = await pool.query(
      `UPDATE hotels
       SET title = $1, description = $2, latitude = $3, longitude = $4, price = $5${imageClause}
       WHERE id = $${file ? 7 : 6} RETURNING *`,
      [...values, req.params.id]
    );

    if (!result.rowCount) return res.status(404).json({ error: "Hotel not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update hotel" });
  }
});

app.delete("/api/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING id, image", [req.params.id]);
    
    if (!result.rowCount) return res.status(404).json({ error: "Hotel not found" });

    const oldImage = result.rows[0].image;
    if (oldImage && oldImage.includes('supabase.co')) {
      const oldFileName = oldImage.split('/').pop();
      await supabase.storage.from("hotels").remove([oldFileName]);
    }

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete hotel" });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}