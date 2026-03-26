require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const cleanupService = require("./services/cleanup.service");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    
    // Start the cleanup service
    cleanupService.startScheduledCleanup();
    
    // Listen on the HTTP server, not app directly
    server.listen(PORT, () =>
      console.log(`EnvSync API running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    console.error(process.env.MONGO_URI);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = () => {
  console.log('\n⚠ Shutting down gracefully...');
  cleanupService.stopScheduledCleanup();
  mongoose.connection.close().then(() => {
    console.log('✓ MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
