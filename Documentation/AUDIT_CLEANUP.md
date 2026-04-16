# Audit Log Cleanup Feature

## Overview
The EnvSync server now includes an **automatic audit log cleanup service** that removes audit logs older than 24 hours. This helps maintain database performance and manages storage efficiently while keeping recent audit history for compliance.

## Features

### 🔄 Automatic Cleanup
- **Retention Period**: 24 hours
- **Cleanup Frequency**: Every hour (at minute 0)
- **Automatic Start**: Starts when server connects to MongoDB
- **Initial Cleanup**: Runs immediately on server startup

### 🛡️ Admin Controls
Administrators have access to manual cleanup controls via API endpoints:

#### 1. Manual Cleanup Trigger
```bash
POST /api/cleanup/run
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "deletedCount": 42,
  "timestamp": "2025-12-25T12:00:00.000Z"
}
```

#### 2. Cleanup Status
```bash
GET /api/cleanup/status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "nextRun": "Every hour at minute 0",
    "oldLogsCount": 15,
    "retentionPeriod": "24 hours",
    "cleanupFrequency": "Every hour"
  }
}
```

## Implementation Details

### Files Created/Modified

1. **`server/src/services/cleanup.service.js`**
   - Core cleanup service using node-cron
   - Singleton pattern for single instance
   - Scheduled job management

2. **`server/src/controllers/cleanup.controller.js`**
   - Admin endpoints for manual cleanup
   - Status checking functionality

3. **`server/src/routes/cleanup.routes.js`**
   - Protected routes (admin-only access)
   - Manual cleanup trigger
   - Status endpoint

4. **`server/src/server.js`**
   - Service initialization on startup
   - Graceful shutdown handling

5. **`server/src/app.js`**
   - Cleanup routes registration

### Dependencies
- **node-cron**: ^3.0.3 (for scheduled jobs)

## How It Works

### Automatic Cleanup Process
```
1. Server starts → MongoDB connects
2. Cleanup service initializes
3. Initial cleanup runs immediately
4. Scheduled job starts (runs every hour)
5. Each hour: Delete logs where createdAt < (now - 24 hours)
```

### Graceful Shutdown
When the server receives SIGINT or SIGTERM:
```
1. Stop scheduled cleanup job
2. Close MongoDB connection
3. Exit process cleanly
```

## Console Output

### On Server Start
```
MongoDB connected
✓ Audit log cleanup service started (runs every hour)
⏰ Running scheduled audit log cleanup...
✓ Cleanup: Deleted 5 audit log(s) older than 24 hours
EnvSync API running on port 4000
```

### Hourly Cleanup
```
⏰ Running scheduled audit log cleanup...
✓ Cleanup: Deleted 3 audit log(s) older than 24 hours
```

### No Logs to Delete
```
⏰ Running scheduled audit log cleanup...
✓ Cleanup: No old audit logs to delete
```

### On Shutdown
```
⚠ Shutting down gracefully...
✓ Audit log cleanup service stopped
✓ MongoDB connection closed
```

## Configuration

### Modify Retention Period
Edit `server/src/services/cleanup.service.js`:

```javascript
// Change from 24 hours to 48 hours
const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
```

### Modify Cleanup Frequency
Edit the cron schedule in `server/src/services/cleanup.service.js`:

```javascript
// Current: Every hour at minute 0
this.cronJob = cron.schedule('0 * * * *', async () => {
  // ...
});

// Examples:
// Every 30 minutes: '*/30 * * * *'
// Every 6 hours: '0 */6 * * *'
// Daily at midnight: '0 0 * * *'
// Every Monday at 3am: '0 3 * * 1'
```

## Testing

### Test Manual Cleanup
```bash
# Login as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Trigger manual cleanup
curl -X POST http://localhost:4000/api/cleanup/run \
  -H "Authorization: Bearer <your_admin_token>"

# Check cleanup status
curl -X GET http://localhost:4000/api/cleanup/status \
  -H "Authorization: Bearer <your_admin_token>"
```

### Verify Automatic Cleanup
1. Create some audit logs (login, create secrets, etc.)
2. Wait 24+ hours or manually change timestamps in MongoDB
3. Wait for next hourly cleanup or trigger manual cleanup
4. Check audit logs collection - old logs should be removed

## Security

- ✅ **Admin-only access**: Only administrators can trigger manual cleanup or check status
- ✅ **Protected routes**: All cleanup endpoints require authentication
- ✅ **Graceful shutdown**: Service stops cleanly on server shutdown
- ✅ **Error handling**: Cleanup failures are logged but don't crash the server

## Benefits

1. **Database Performance**: Prevents audit log table from growing indefinitely
2. **Storage Management**: Reduces database storage requirements
3. **Compliance**: Maintains recent audit history (24 hours) for security monitoring
4. **Automation**: No manual intervention required
5. **Flexibility**: Admin can trigger cleanup manually if needed

## Monitoring

### Check Cleanup Logs
Monitor server console for cleanup activity:
```bash
# In production, check logs
tail -f /var/log/envsync/server.log | grep -i cleanup
```

### Database Monitoring
```javascript
// Check audit log count in MongoDB
db.auditlogs.countDocuments()

// Check oldest log
db.auditlogs.find().sort({createdAt: 1}).limit(1)

// Check logs older than 24 hours
db.auditlogs.countDocuments({
  createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
})
```

## Troubleshooting

### Cleanup Not Running
1. Check server logs for errors
2. Verify node-cron is installed: `npm list node-cron`
3. Check MongoDB connection
4. Verify cleanup service started: Look for "✓ Audit log cleanup service started"

### Manual Cleanup Fails
1. Verify admin authentication
2. Check MongoDB connection
3. Review server logs for error details

### Logs Not Being Deleted
1. Check if logs are actually older than 24 hours
2. Trigger manual cleanup to test
3. Check cleanup status endpoint for `oldLogsCount`

## Future Enhancements

Potential improvements for the cleanup feature:

- [ ] Configurable retention period via environment variable
- [ ] Archive old logs to file before deletion
- [ ] Cleanup metrics dashboard in admin panel
- [ ] Email notifications for cleanup failures
- [ ] Selective cleanup (keep certain action types longer)
- [ ] Compression of old logs instead of deletion

---

**Last Updated**: December 25, 2025
**Version**: 1.0.0
