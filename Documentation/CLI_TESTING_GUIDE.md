# EnvSync CLI - Complete Testing Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [CLI Installation](#cli-installation)
3. [Command Testing](#command-testing)
4. [Integration Testing](#integration-testing)
5. [Error Scenarios](#error-scenarios)
6. [Security Testing](#security-testing)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before testing the CLI, ensure:

- [ ] Node.js installed (v14 or higher)
- [ ] EnvSync server running on `http://localhost:4000`
- [ ] MongoDB running and connected
- [ ] Admin user created via `create_user.js` script
- [ ] At least one project created with secrets
- [ ] Terminal/Command Prompt access

### Quick Server Check

```bash
# Check if server is running
curl http://localhost:4000/health

# Expected response:
# {"status":"EnvSync API running"}
```

---

## 🔧 CLI Installation

### Step 1: Install Dependencies

```bash
cd h:\envSync\cli
npm install
```

**Expected Output:**
```
added X packages in Ys
```

### Step 2: Link CLI Globally (Recommended)

```bash
npm link
```

**Expected Output:**
```
added 1 package, and audited X packages in Ys
```

**Verify Installation:**
```bash
envsync --version
```

**Expected:** `1.0.0`

### Alternative: Run Without Linking

If you don't want to link globally:
```bash
node h:\envSync\cli\bin\envsync.js <command>
```

---

## 🧪 Command Testing

### Test 1: `envsync login`

#### Test 1.1: Successful Login (Admin)

**Command:**
```bash
envsync login
```

**Input:**
```
Email: hardikm332004@gmail.com
Password: 123456
```

**Expected Output:**
```
✓ Logged in successfully
```

**Verification:**
```bash
# Check if token was saved
# Windows:
dir %USERPROFILE%\.envsync

# Mac/Linux:
ls ~/.envsync
```

**Expected:** Token file should exist

---

#### Test 1.2: Failed Login (Wrong Password)

**Command:**
```bash
envsync login
```

**Input:**
```
Email: hardikm332004@gmail.com
Password: wrongpassword
```

**Expected Output:**
```
✗ Login failed
```

**Verification:** No token should be saved

---

#### Test 1.3: Failed Login (Non-existent User)

**Command:**
```bash
envsync login
```

**Input:**
```
Email: nonexistent@example.com
Password: anypassword
```

**Expected Output:**
```
✗ Login failed
```

---

#### Test 1.4: Missing Credentials

**Command:**
```bash
envsync login
```

**Input:**
```
Email: [press Enter without typing]
Password: [press Enter without typing]
```

**Expected Output:**
```
✗ Login failed
```

---

### Test 2: `envsync whoami`

#### Test 2.1: Check User (When Logged In)

**Prerequisites:** Must be logged in

**Command:**
```bash
envsync whoami
```

**Expected Output:**
```
Logged in as: hardikm332004@gmail.com (role: admin)
```

---

#### Test 2.2: Check User (When Not Logged In)

**Prerequisites:** Must be logged out

**Command:**
```bash
envsync logout
envsync whoami
```

**Expected Output:**
```
Not logged in
```

---

### Test 3: `envsync logout`

#### Test 3.1: Successful Logout

**Prerequisites:** Must be logged in

**Command:**
```bash
envsync logout
```

**Expected Output:**
```
✓ Logged out successfully
```

**Verification:**
```bash
envsync whoami
```

**Expected:** `Not logged in`

---

#### Test 3.2: Logout When Already Logged Out

**Command:**
```bash
envsync logout
envsync logout
```

**Expected Output:**
```
✓ Logged out successfully
✓ Logged out successfully
```

**Note:** Should not error even if already logged out

---

### Test 4: `envsync run` (Core Feature)

#### Test 4.1: Run Simple Command

**Prerequisites:** 
- Logged in
- Have project ID and secrets configured

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node --version
```

**Expected Output:**
```
⚠️  SECURITY NOTICE:
   Secrets are being injected into your application.
   Logging or exposing these secrets is against security policy.
   All secret access is audited and monitored.

✓ Injected X secret(s): DATABASE_URL, API_KEY, ...

v18.x.x
```

---

#### Test 4.2: Run with Environment Variables

**Create a test script:**

**File: `test-env.js`**
```javascript
console.log('Testing EnvSync...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('API_KEY exists:', !!process.env.API_KEY);
console.log('All env keys:', Object.keys(process.env).filter(k => 
  ['DATABASE_URL', 'API_KEY', 'JWT_SECRET', 'PORT'].includes(k)
));
```

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node test-env.js
```

**Expected Output:**
```
⚠️  SECURITY NOTICE:
   ...

✓ Injected 4 secret(s): DATABASE_URL, API_KEY, JWT_SECRET, PORT

Testing EnvSync...
DATABASE_URL exists: true
API_KEY exists: true
All env keys: [ 'DATABASE_URL', 'API_KEY', 'JWT_SECRET', 'PORT' ]
```

---

#### Test 4.3: Run npm Command

**Prerequisites:** Have a package.json with a start script

**Command:**
```bash
cd h:\your-test-project
envsync run --project YOUR_PROJECT_ID --env dev npm start
```

**Expected:** Application starts with injected secrets

---

#### Test 4.4: Run with Different Environments

**Test Dev Environment:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node test-env.js
```

**Test Prod Environment:**
```bash
envsync run --project YOUR_PROJECT_ID --env prod node test-env.js
```

**Verification:** Different secret values should be injected based on environment

---

#### Test 4.5: Missing Required Options

**Test Missing --project:**
```bash
envsync run --env dev node --version
```

**Expected Output:**
```
error: required option '--project <id>' not specified
```

**Test Missing --env:**
```bash
envsync run --project YOUR_PROJECT_ID node --version
```

**Expected Output:**
```
error: required option '--env <environment>' not specified
```

**Test Missing Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev
```

**Expected Output:**
```
error: missing required argument 'cmd'
```

---

#### Test 4.6: Invalid Project ID

**Command:**
```bash
envsync run --project invalid_project_id --env dev node --version
```

**Expected Output:**
```
Error fetching secrets: [error message]
```

---

#### Test 4.7: Invalid Environment

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env invalid_env node --version
```

**Expected:** May return empty secrets or error depending on server validation

---

#### Test 4.8: Not Logged In

**Command:**
```bash
envsync logout
envsync run --project YOUR_PROJECT_ID --env dev node --version
```

**Expected Output:**
```
Error fetching secrets: Request failed with status code 401
```

---

#### Test 4.9: Access Denied (Developer Role)

**Prerequisites:** Login as developer (not admin)

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node --version
```

**Expected:** Should work! Developers can access runtime secrets.

**Note:** Developers can use `envsync run` but cannot view secrets via API directly.

---

## 🔗 Integration Testing

### Scenario 1: Complete Workflow Test

**Step-by-step test of entire CLI workflow:**

```bash
# 1. Start fresh (logout if logged in)
envsync logout

# 2. Verify not logged in
envsync whoami
# Expected: "Not logged in"

# 3. Login
envsync login
# Enter credentials

# 4. Verify login
envsync whoami
# Expected: Shows user email and role

# 5. Run application with secrets
envsync run --project YOUR_PROJECT_ID --env dev node test-env.js
# Expected: Secrets injected successfully

# 6. Logout
envsync logout

# 7. Verify logout
envsync whoami
# Expected: "Not logged in"

# 8. Try to run without login (should fail)
envsync run --project YOUR_PROJECT_ID --env dev node --version
# Expected: Error - not authenticated
```

**All steps should complete successfully!**

---

### Scenario 2: Multi-Environment Testing

**Create test script:**

**File: `env-test.js`**
```javascript
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('Database:', process.env.DATABASE_URL || 'not set');
console.log('Port:', process.env.PORT || 'not set');
```

**Test:**
```bash
# Test dev environment
envsync run --project YOUR_PROJECT_ID --env dev node env-test.js

# Test prod environment
envsync run --project YOUR_PROJECT_ID --env prod node env-test.js
```

**Verification:** 
- Different values should be shown for dev vs prod
- Confirms environment isolation works correctly

---

### Scenario 3: MERN Application Testing

**Test with actual MERN stack application:**

**Server Test:**
```bash
cd h:\your-mern-app\server
envsync run --project YOUR_PROJECT_ID --env dev npm start
```

**Expected:**
- Server starts on correct port
- MongoDB connects successfully
- No environment variable errors

**Client Test (separate terminal):**
```bash
cd h:\your-mern-app\client
envsync run --project YOUR_PROJECT_ID --env dev npm start
```

**Expected:**
- React app compiles successfully
- Correct API URL configured
- App loads in browser

**Integration Test:**
- Make API call from client to server
- Verify communication works
- Check that secrets are properly injected on both sides

---

### Scenario 4: Long-Running Process

**Test that secrets persist for long-running applications:**

**Create test script:**

**File: `long-running.js`**
```javascript
console.log('Starting long-running process...');
console.log('DB URL available:', !!process.env.DATABASE_URL);

let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(`Tick ${count}: DB URL still available:`, !!process.env.DATABASE_URL);
  
  if (count >= 5) {
    clearInterval(interval);
    console.log('Process complete!');
    process.exit(0);
  }
}, 2000);
```

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node long-running.js
```

**Expected Output:**
```
⚠️  SECURITY NOTICE: ...
✓ Injected X secret(s): ...

Starting long-running process...
DB URL available: true
Tick 1: DB URL still available: true
Tick 2: DB URL still available: true
Tick 3: DB URL still available: true
Tick 4: DB URL still available: true
Tick 5: DB URL still available: true
Process complete!
```

**Verification:** Secrets remain available throughout process lifetime

---

## ❌ Error Scenarios Testing

### Error 1: Server Not Running

**Setup:**
```bash
# Stop EnvSync server
```

**Test:**
```bash
envsync login
```

**Expected Output:**
```
✗ Login failed
```

**Or:**
```
Error: connect ECONNREFUSED 127.0.0.1:4000
```

---

### Error 2: Network Issues

**Simulate by using wrong API URL:**

**Edit `cli/.env`:**
```env
ENVSYNC_API_URL=http://localhost:9999/api
```

**Test:**
```bash
envsync login
```

**Expected:** Connection error

**Fix:** Restore correct URL

---

### Error 3: Expired Token

**Simulate by manually editing token file with invalid token:**

**Test:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node --version
```

**Expected Output:**
```
Error fetching secrets: Request failed with status code 401
```

**Fix:**
```bash
envsync login
```

---

### Error 4: Command Not Found

**Test:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev nonexistent-command
```

**Expected Output:**
```
Error: spawn nonexistent-command ENOENT
```

---

### Error 5: Invalid Command Syntax

**Test:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev npm start --invalid-flag
```

**Expected:** npm error about invalid flag (passed through to npm)

---

## 🔒 Security Testing

### Security Test 1: Token Storage Security

**Check token file permissions:**

**Windows:**
```powershell
Get-Acl $env:USERPROFILE\.envsync\token | Format-List
```

**Mac/Linux:**
```bash
ls -la ~/.envsync/token
```

**Expected:** File should have restricted permissions

---

### Security Test 2: Secret Redaction (If Implemented)

**Create test script:**

**File: `log-test.js`**
```javascript
console.log('Database URL:', process.env.DATABASE_URL);
console.log('API Key:', process.env.API_KEY);
console.log('Full env:', process.env);
```

**Command:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node log-test.js
```

**Expected:** 
- Security warning displayed
- If security wrapper active: Values should be redacted
- If not: Values will be visible (developer responsibility)

---

### Security Test 3: Audit Trail Verification

**After running commands, check audit logs via API:**

**Using Postman/curl:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/audit
```

**Expected:** Should see `RUNTIME_SECRET_ACCESS` entries for each `envsync run` command

---

### Security Test 4: Role-Based Access

**Test Developer Access:**

**Create developer user first (via server script or API)**

**Login as developer:**
```bash
envsync login
# Email: developer@example.com
# Password: devpass123
```

**Test runtime access (should work):**
```bash
envsync run --project YOUR_PROJECT_ID --env dev node --version
```

**Expected:** ✓ Works - developers can use runtime injection

**Test API access (should fail):**
```bash
# Try to list secrets via API (using Postman with developer token)
GET /api/secrets?projectId=...&environment=dev
```

**Expected:** 403 Forbidden - developers cannot view secrets

---

## 🐛 Troubleshooting

### Issue 1: `envsync: command not found`

**Cause:** CLI not linked globally

**Solution:**
```bash
cd h:\envSync\cli
npm link
```

**Alternative:**
```bash
# Use full path
node h:\envSync\cli\bin\envsync.js login
```

---

### Issue 2: Login fails with correct credentials

**Possible Causes:**
1. Server not running
2. Wrong API URL in `.env`
3. Network issues

**Debug:**
```bash
# Check server
curl http://localhost:4000/health

# Check CLI config
type h:\envSync\cli\.env

# Check server logs
```

---

### Issue 3: Secrets not injected

**Symptoms:** Application can't access environment variables

**Debug:**
```bash
# Create debug script
# File: debug.js
console.log('All env vars:', Object.keys(process.env));
console.log('DATABASE_URL:', process.env.DATABASE_URL);

# Run with EnvSync
envsync run --project YOUR_PROJECT_ID --env dev node debug.js
```

**Check:**
- Correct project ID?
- Correct environment?
- Secrets exist for that project/env?
- Logged in?

---

### Issue 4: Token expired

**Symptoms:** 401 errors after some time

**Solution:**
```bash
envsync logout
envsync login
```

---

### Issue 5: Wrong secrets loaded

**Cause:** Using wrong environment flag

**Verify:**
```bash
# Check which environment you're using
envsync run --project YOUR_PROJECT_ID --env dev node debug.js
# vs
envsync run --project YOUR_PROJECT_ID --env prod node debug.js
```

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] CLI installs without errors
- [ ] `envsync --version` works
- [ ] `envsync login` works with valid credentials
- [ ] `envsync login` fails with invalid credentials
- [ ] `envsync whoami` shows correct user
- [ ] `envsync logout` clears token
- [ ] `envsync run` injects secrets correctly
- [ ] Security warning displays

### Environment Testing
- [ ] Dev environment secrets work
- [ ] Prod environment secrets work
- [ ] Staging environment secrets work (if configured)
- [ ] Different environments have different values

### Error Handling
- [ ] Handles missing --project flag
- [ ] Handles missing --env flag
- [ ] Handles missing command
- [ ] Handles invalid project ID
- [ ] Handles server offline
- [ ] Handles network errors
- [ ] Handles expired tokens
- [ ] Handles invalid commands

### Security
- [ ] Token stored securely
- [ ] Secrets not logged (if wrapper active)
- [ ] Audit trail created
- [ ] Role-based access works
- [ ] Unauthorized access blocked

### Integration
- [ ] Works with Node.js apps
- [ ] Works with npm scripts
- [ ] Works with MERN stack
- [ ] Works with long-running processes
- [ ] Multiple secrets injected correctly

---

## 🎯 Quick Test Script

**Create this script to test all basic functionality:**

**File: `test-cli.sh` (Mac/Linux) or `test-cli.bat` (Windows)**

```bash
#!/bin/bash

echo "=== EnvSync CLI Test Suite ==="
echo ""

echo "Test 1: Version check"
envsync --version
echo ""

echo "Test 2: Logout (cleanup)"
envsync logout
echo ""

echo "Test 3: Whoami (should be not logged in)"
envsync whoami
echo ""

echo "Test 4: Login"
echo "hardikm332004@gmail.com" | envsync login
echo "123456" | envsync login
echo ""

echo "Test 5: Whoami (should show user)"
envsync whoami
echo ""

echo "Test 6: Run simple command"
envsync run --project YOUR_PROJECT_ID --env dev node --version
echo ""

echo "Test 7: Logout"
envsync logout
echo ""

echo "=== All tests complete ==="
```

**Run:**
```bash
chmod +x test-cli.sh
./test-cli.sh
```

---

## 📝 Test Report Template

After testing, document results:

```markdown
# EnvSync CLI Test Report

**Date:** 2025-12-25
**Tester:** [Your Name]
**Version:** 1.0.0

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Installation | ✅ PASS | No issues |
| Login (valid) | ✅ PASS | Token saved |
| Login (invalid) | ✅ PASS | Error shown |
| Whoami | ✅ PASS | Correct info |
| Logout | ✅ PASS | Token cleared |
| Run (dev) | ✅ PASS | Secrets injected |
| Run (prod) | ✅ PASS | Different values |
| Error handling | ✅ PASS | Appropriate errors |
| Security | ✅ PASS | Audit logs created |

## Issues Found

1. [None / List any issues]

## Recommendations

1. [Any suggestions for improvement]
```

---

## 💡 Pro Tips

1. **Use aliases** for frequently used commands:
   ```bash
   alias erun="envsync run --project YOUR_PROJECT_ID --env dev"
   erun npm start
   ```

2. **Create environment-specific scripts** in package.json:
   ```json
   {
     "scripts": {
       "dev": "envsync run --project ID --env dev npm start",
       "prod": "envsync run --project ID --env prod npm start"
     }
   }
   ```

3. **Keep project ID handy** in a local config file (not committed):
   ```bash
   echo "PROJECT_ID=507f..." > .envsync-project
   ```

4. **Test in isolation** - Use separate test project for CLI testing

5. **Monitor audit logs** - Verify all CLI actions are logged

---

*Happy Testing! 🚀*
