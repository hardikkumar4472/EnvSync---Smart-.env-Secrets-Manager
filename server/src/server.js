require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");
const initAuditWorker = require("./workers/auditWorker");
const initMaintenanceWorker = require("./workers/maintenanceWorker");
const { initMaintenanceJobs } = require("./queues/maintenanceQueue");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    
    // Start Server immediately
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`EnvSync API running on port ${PORT}`)
    );

    // Initialize Background Jobs (Async)
    try {
      initAuditWorker();
      initMaintenanceWorker();
      await initMaintenanceJobs();
    } catch (err) {
      console.error("Background system initialization failed:", err.message);
    }
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    console.error(process.env.MONGO_URI);
    process.exit(1);
  });

const shutdown = () => {
  console.log('\n⚠ Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('✓ MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
