const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   MIDDLEWARES
========================================================= */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* =========================================================
   MULTER (SUBIDA DE IMÁGENES)
========================================================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* =========================================================
   CONEXIÓN MYSQL (ROBUSTA PARA RAILWAY)
========================================================= */
let db = null;

async function connectDB(retries = 5) {
  try {
    db = await mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: Number(process.env.MYSQLPORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await db.query("SELECT 1");
    console.log("✅ MySQL conectado");
  } catch (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
    if (retries > 0) {
      console.log("⏳ Reintentando conexión en 5s...");
      setTimeout(() => connectDB(retries - 1), 5000);
    }
  }
}

connectDB();

/* =========================================================
   HEALTHCHECK
========================================================= */
app.get("/health", async (_req, res) => {
  try {
    if (!db) return res.status(503).json({ ok: false, db: "not_ready" });
    await db.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================================================
   AUTH — REGISTRO
========================================================= */
app.post("/register", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ message: "BD no disponible" });

    const { name, email, password, bride_name, groom_name, domain } = req.body;

    if (!name || !email || !password || !domain) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const [exists] = await db.query(
      "SELECT id FROM users WHERE email = ? OR domain = ?",
      [email, domain]
    );

    if (exists.length) {
      return res.status(409).json({ message: "Usuario o dominio ya existe" });
    }

    const hash = await bcrypt.hash(String(password), 10);

    await db.query(
      `INSERT INTO users 
      (name, email, password, bride_name, groom_name, domain) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hash, bride_name, groom_name, domain]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Error interno" });
  }
});

/* =========================================================
   AUTH — LOGIN
========================================================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Usuario no existe" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* =========================================================
   USUARIO — INFO COMPLETA
========================================================= */
app.get("/user/info/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* =========================================================
   USUARIO — ACTUALIZAR INFO
========================================================= */
app.put("/user/info/:id", async (req, res) => {
  try {
    const data = { ...req.body };

    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key] = JSON.stringify(data[key]);
      }
    });

    await db.query("UPDATE users SET ? WHERE id = ?", [
      data,
      req.params.id,
    ]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* =========================================================
   SUBIR FOTO — NOVIOS
========================================================= */
app.post("/upload-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido archivo" });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json({ imageUrl: `${baseUrl}/uploads/${req.file.filename}` });
});

/* =========================================================
   SUBIR FOTO — INVITADOS
========================================================= */
app.post("/public/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !req.file) {
      return res.status(400).json({ message: "Código o archivo faltante" });
    }

    const [rows] = await db.query(
      `SELECT id, photos_json 
       FROM users 
       WHERE guest_upload_code = ? AND guest_upload_enabled = 1`,
      [code]
    );

    if (!rows.length) {
      return res.status(403).json({ message: "Código incorrecto" });
    }

    const user = rows[0];
    let photos = [];

    if (typeof user.photos_json === "string" && user.photos_json.trim()) {
      photos = JSON.parse(user.photos_json);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    photos.push(imageUrl);

    await db.query(
      "UPDATE users SET photos_json = ? WHERE id = ?",
      [JSON.stringify(photos), user.id]
    );

    res.json({ ok: true, imageUrl });
  } catch (err) {
    res.status(500).json({ message: "Error subiendo imagen" });
  }
});

/* =========================================================
   WEB PÚBLICA — POR DOMINIO
========================================================= */
app.get("/public/:domain", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE domain = ?",
      [req.params.domain]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Dominio no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

/* =========================================================
   GUARDAR INVITADOS
========================================================= */
app.put("/user/guests/:id", async (req, res) => {
  if (!Array.isArray(req.body.guests_json)) {
    return res.status(400).json({ message: "Formato incorrecto" });
  }

  await db.query(
    "UPDATE users SET guests_json = ? WHERE id = ?",
    [JSON.stringify(req.body.guests]()
