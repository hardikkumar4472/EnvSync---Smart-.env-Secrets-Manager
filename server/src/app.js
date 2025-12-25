const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://envsync.onrender.com',
    'https://envsync-dp6u.onrender.com' // Your deployed frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'envsync-secret-key-change-it',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/protected", require("./routes/protected.routes"));
app.use("/api/admin", require("./routes/admin.route"));
app.use("/api/secrets", require("./routes/secret.routes"));
app.use("/api/runtime", require("./routes/runtime.routes"));
app.use("/api/audit", require("./routes/audit.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/cleanup", require("./routes/cleanup.routes"));
app.get("/health", (req, res) => {
  res.json({ status: "EnvSync API running" });
});
module.exports = app;
