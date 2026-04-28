const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { redisConnection } = require("./config/redis");
const { RedisStore } = require("connect-redis");

const app = express();

// Initialize Redis Session Store
let redisStore = new RedisStore({
  client: redisConnection,
  prefix: "envsync_sess:",
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://envsync.onrender.com',
  'https://envsync-dp6u.onrender.com',
  'https://envsync-sockets.onrender.com',
  'https://envsync-rsm.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'envsync-secret-key-change-it',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days session
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

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(isDevelopment && { stack: err.stack, error: err })
  });
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
