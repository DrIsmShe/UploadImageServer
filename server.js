const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected...");
});

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const fileName = req.file.filename;
  const filePath = req.file.path;

  const sql = "INSERT INTO upload_img_file (name, path) VALUES (?, ?)";
  db.query(sql, [fileName, filePath], (err, result) => {
    if (err) throw err;
    res.json({ file: req.file });
  });
});

app.get("/images", (req, res) => {
  const sql = "SELECT * FROM upload_img_file";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching images:", err);
      res.status(500).json({ error: "Failed to fetch images" });
    } else {
      res.json(results);
    }
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
