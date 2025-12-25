# EnvSync Testing Guide - Complete Workflow

## 🎯 Goal
Test EnvSync with your existing project that currently uses a `.env` file, without modifying your project code.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] MongoDB installed and running
- [ ] Node.js installed
- [ ] Your existing project with `.env` file
- [ ] EnvSync server and CLI code

---

## 🔧 Step 1: Configure EnvSync Server

### 1.1 Create Server Environment File

Create `h:\envSync\server\.env` with the following content:

```env
# Server Configuration
PORT=4000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/envsync

# Encryption Master Key (KEEP THIS SECRET!)
SECRET_MASTER_KEY=your-super-secret-master-key-change-this-in-production

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this-too
JWT_EXPIRES_IN=7d
```

**Important:** Change the secret keys to something secure!

### 1.2 Install Server Dependencies

```bash
cd h:\envSync\server
npm install
```

### 1.3 Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows - if MongoDB is installed as a service, it should already be running
# Check with:
mongosh
# If it connects, MongoDB is running. Type 'exit' to quit.
```

---

## 👤 Step 2: Create Admin User

### 2.1 Run the User Creation Script

```bash
cd h:\envSync\server
node scripts/create_user.js
```

**Expected Output:**
```
MongoDB connected
User created successfully: hardikm332004@gmail.com
MongoDB disconnected
```

**Default Credentials:**
- Email: `hardikm332004@gmail.com`
- Password: `123456`
- Role: `admin`

**Note:** You can modify `scripts/create_user.js` to change these credentials before running.

---

## 🚀 Step 3: Start EnvSync Server

```bash
cd h:\envSync\server\src
node server.js
```

**Expected Output:**
```
MongoDB connected
EnvSync API running on port 4000
```

**Keep this terminal running!** Open a new terminal for the next steps.

---

## 🏗️ Step 4: Create a Project

You need to create a project in EnvSync to organize your secrets.

### 4.1 Using curl (Windows PowerShell)

First, login to get a token:

```powershell
# Login and get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body (@{email="hardikm332004@gmail.com"; password="123456"} | ConvertTo-Json) -ContentType "application/json"

# Save the token
$token = $loginResponse.token
Write-Host "Token: $token"
```

Now create a project:

```powershell
# Create project
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$projectBody = @{
    name = "MyTestProject"
    description = "Testing EnvSync with my existing project"
} | ConvertTo-Json

$project = Invoke-RestMethod -Uri "http://localhost:4000/api/projects" -Method POST -Headers $headers -Body $projectBody

# Save the project ID
$projectId = $project.id
Write-Host "Project ID: $projectId"
```

**Save this Project ID!** You'll need it for the next steps.

### 4.2 Alternative: Using Postman or Thunder Client

If you prefer a GUI:

1. **Login:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "hardikm332004@gmail.com",
       "password": "123456"
     }
     ```
   - Copy the `token` from the response

2. **Create Project:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/projects`
   - Headers:
     - `Authorization`: `Bearer YOUR_TOKEN_HERE`
     - `Content-Type`: `application/json`
   - Body (JSON):
     ```json
     {
       "name": "MyTestProject",
       "description": "Testing EnvSync"
     }
     ```
   - Copy the `id` from the response (this is your Project ID)

---

## 🔐 Step 5: Migrate Your .env Secrets to EnvSync

### 5.1 Identify Your Current .env Variables

Go to your existing project and open the `.env` file. For example:

```env
# Your existing .env file
DATABASE_URL=mongodb://localhost:27017/myapp
API_KEY=sk-1234567890abcdef
JWT_SECRET=my-jwt-secret
PORT=3000
NODE_ENV=development
```

### 5.2 Upload Each Secret to EnvSync

For each variable in your `.env`, create a secret in EnvSync:

**Using PowerShell:**

```powershell
# Make sure you still have $token and $projectId from Step 4

# Function to create a secret
function Add-EnvSyncSecret {
    param($key, $value, $environment)
    
    $secretBody = @{
        projectId = $projectId
        environment = $environment
        key = $key
        value = $value
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Invoke-RestMethod -Uri "http://localhost:4000/api/secrets" -Method POST -Headers $headers -Body $secretBody
    Write-Host "✓ Added secret: $key"
}

# Add your secrets (replace with your actual values)
Add-EnvSyncSecret -key "DATABASE_URL" -value "mongodb://localhost:27017/myapp" -environment "dev"
Add-EnvSyncSecret -key "API_KEY" -value "sk-1234567890abcdef" -environment "dev"
Add-EnvSyncSecret -key "JWT_SECRET" -value "my-jwt-secret" -environment "dev"
Add-EnvSyncSecret -key "PORT" -value "3000" -environment "dev"
Add-EnvSyncSecret -key "NODE_ENV" -value "development" -environment "dev"
```

**Using Postman/Thunder Client:**

For each variable, send:
- Method: `POST`
- URL: `http://localhost:4000/api/secrets`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN`
  - `Content-Type`: `application/json`
- Body (JSON):
  ```json
  {
    "projectId": "YOUR_PROJECT_ID",
    "environment": "dev",
    "key": "DATABASE_URL",
    "value": "mongodb://localhost:27017/myapp"
  }
  ```

Repeat for each environment variable.

### 5.3 Verify Secrets Were Stored

```powershell
# List all secrets for your project
$listUrl = "http://localhost:4000/api/secrets?projectId=$projectId&environment=dev"
$secrets = Invoke-RestMethod -Uri $listUrl -Method GET -Headers $headers

# Display secrets (values will be encrypted)
$secrets | ConvertTo-Json
```

You should see your secrets listed (with encrypted values).

---

## 💻 Step 6: Install and Configure EnvSync CLI

### 6.1 Install CLI Dependencies

```bash
cd h:\envSync\cli
npm install
```

### 6.2 Link CLI Globally (Optional but Recommended)

```bash
cd h:\envSync\cli
npm link
```

This makes the `envsync` command available globally.

**Alternative:** If you don't want to link globally, you can run it directly:
```bash
node h:\envSync\cli\bin\envsync.js <command>
```

### 6.3 Configure CLI Environment

Create `h:\envSync\cli\.env`:

```env
ENVSYNC_API_URL=http://localhost:4000/api
```

---

## 🔑 Step 7: Login with CLI

```bash
envsync login
```

**You'll be prompted:**
```
Email: hardikm332004@gmail.com
Password: 123456
✓ Logged in successfully
```

### 7.1 Verify Login

```bash
envsync whoami
```

**Expected Output:**
```
Logged in as: hardikm332004@gmail.com (role: admin)
```

---

## 🧪 Step 8: Test with Your Project

### 8.1 Backup Your Original .env File

```bash
# In your project directory
cd h:\your-project-path
copy .env .env.backup
```

### 8.2 Rename or Delete .env (Optional)

To ensure EnvSync is working and not falling back to `.env`:

```bash
# Rename it so it won't be loaded
ren .env .env.disabled
```

### 8.3 Run Your Project with EnvSync

**Basic syntax:**
```bash
envsync run --project YOUR_PROJECT_ID --env dev <your-normal-start-command>
```

**Examples:**

If you normally run `npm start`:
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev npm start
```

If you normally run `node server.js`:
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev node server.js
```

If you normally run `npm run dev`:
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev npm run dev
```

**Replace `507f1f77bcf86cd799439011` with your actual Project ID from Step 4!**

### 8.4 Verify It's Working

Your application should start normally and have access to all environment variables!

**To verify secrets are being injected, add a test in your application:**

```javascript
// Add this temporarily to your app's entry point
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('API_KEY:', process.env.API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing');
```

You should see:
```
DATABASE_URL: ✓ Loaded
API_KEY: ✓ Loaded
JWT_SECRET: ✓ Loaded
```

---

## 🎯 Step 9: Test Different Environments

### 9.1 Create Production Secrets

```powershell
# Add production secrets (with different values)
Add-EnvSyncSecret -key "DATABASE_URL" -value "mongodb://prod-server:27017/myapp" -environment "prod"
Add-EnvSyncSecret -key "API_KEY" -value "sk-prod-key-different" -environment "prod"
Add-EnvSyncSecret -key "JWT_SECRET" -value "prod-jwt-secret" -environment "prod"
Add-EnvSyncSecret -key "PORT" -value "8080" -environment "prod"
Add-EnvSyncSecret -key "NODE_ENV" -value "production" -environment "prod"
```

### 9.2 Run with Production Environment

```bash
envsync run --project YOUR_PROJECT_ID --env prod npm start
```

Your app will now use production secrets!

---

## 🔍 Step 10: Verify Security

### 10.1 Check That Secrets Aren't Written to Disk

After running your app with EnvSync:

1. Search your project directory for any new `.env` files
2. Check if any logs contain plaintext secrets
3. Verify that secrets only exist in memory

### 10.2 Check Audit Logs

```powershell
# View audit logs
$auditUrl = "http://localhost:4000/api/audit"
$auditLogs = Invoke-RestMethod -Uri $auditUrl -Method GET -Headers $headers

# Display recent actions
$auditLogs | ConvertTo-Json
```

You should see entries like:
- `LOGIN`
- `SECRET_CREATE`
- `RUNTIME_SECRET_ACCESS`

---

## 📊 Complete Testing Checklist

- [ ] MongoDB is running
- [ ] EnvSync server is running on port 4000
- [ ] Admin user created successfully
- [ ] Project created and Project ID saved
- [ ] All .env variables uploaded as secrets
- [ ] Secrets verified in database (encrypted)
- [ ] CLI installed and linked
- [ ] Successfully logged in via CLI
- [ ] Original .env file backed up
- [ ] Application runs with `envsync run` command
- [ ] Environment variables are accessible in app
- [ ] Tested with different environments (dev/prod)
- [ ] Verified secrets aren't written to disk
- [ ] Checked audit logs

---

## 🐛 Troubleshooting

### Problem: "MongoDB connection failed"
**Solution:** 
- Ensure MongoDB is running: `mongosh`
- Check MONGO_URI in server/.env
- Verify MongoDB is listening on port 27017

### Problem: "Login failed"
**Solution:**
- Verify you ran `create_user.js` successfully
- Check email and password match
- Ensure server is running

### Problem: "Token not found" when running envsync run
**Solution:**
- Run `envsync login` first
- Check if token was saved (should be in ~/.envsync or similar)

### Problem: "Environment variables not loaded in app"
**Solution:**
- Verify Project ID is correct
- Check environment name (dev/staging/prod)
- Ensure secrets were created for that environment
- Use `console.log(process.env)` to debug

### Problem: "Cannot find module" errors
**Solution:**
- Run `npm install` in both server and cli directories
- Check Node.js version compatibility

---

## 🎉 Success Criteria

Your EnvSync is working correctly if:

✅ Your application starts without the `.env` file  
✅ All environment variables are accessible via `process.env`  
✅ Application functions exactly as before  
✅ Secrets are encrypted in MongoDB  
✅ Audit logs show RUNTIME_SECRET_ACCESS events  
✅ You can switch between dev/prod environments easily  

---

## 🔄 Quick Reference Commands

```bash
# Start server
cd h:\envSync\server\src
node server.js

# CLI login
envsync login

# Check current user
envsync whoami

# Run your app with secrets
envsync run --project <PROJECT_ID> --env dev npm start

# Logout
envsync logout
```

---

## 📝 Next Steps

After successful testing:

1. **Add more environments:** staging, test, etc.
2. **Invite team members:** Create developer accounts
3. **Set up production:** Use secure MongoDB hosting
4. **Enable HTTPS:** For production API
5. **Rotate secrets:** Regularly update sensitive keys
6. **Monitor audit logs:** Track secret access

---

## 🔒 Security Best Practices

1. **Never commit** `.env` files to version control
2. **Rotate** SECRET_MASTER_KEY and JWT_SECRET regularly
3. **Use HTTPS** in production
4. **Limit** admin access to trusted users
5. **Review** audit logs regularly
6. **Backup** MongoDB database
7. **Use strong** master keys (32+ characters, random)

---

*Happy Testing! 🚀*
