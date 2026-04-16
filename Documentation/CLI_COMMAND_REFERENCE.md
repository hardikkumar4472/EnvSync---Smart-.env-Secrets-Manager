# EnvSync CLI - Complete Command Reference

## 📋 All EnvSync Commands

---

## 1. `envsync --version`

### Description
Display the current version of EnvSync CLI.

### Syntax
```bash
envsync --version
```

### Options
None

### Example
```bash
envsync --version
```

### Expected Output
```
1.0.0
```

### Use Case
- Check installed CLI version
- Verify CLI installation
- Troubleshooting

---

## 2. `envsync --help`

### Description
Display help information for all available commands.

### Syntax
```bash
envsync --help
```

### Options
None

### Example
```bash
envsync --help
```

### Expected Output
```
Usage: envsync [options] [command]

Runtime-only secret injection CLI

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  login              Login to EnvSync
  whoami             Show current user
  logout             Logout
  run [options]      Run command with runtime secrets
  help [command]     display help for command
```

### Use Case
- Learn available commands
- Quick reference
- First-time users

---

## 3. `envsync login`

### Description
Authenticate with the EnvSync server and save JWT token locally.

### Syntax
```bash
envsync login
```

### Options
None (interactive prompts)

### Interactive Prompts
1. **Email:** Your registered email address
2. **Password:** Your account password

### Example
```bash
envsync login
```

**Interaction:**
```
Email: hardikm332004@gmail.com
Password: ******
✓ Logged in successfully
```

### What It Does
1. Prompts for email and password
2. Sends POST request to `/api/auth/login`
3. Receives JWT token from server
4. Saves token to `~/.envsync/token.json` (Windows: `C:\Users\YourName\.envsync\token.json`)
5. Displays success or error message

### Token Storage Location
- **Windows:** `C:\Users\<Username>\.envsync\token.json`
- **Mac/Linux:** `~/.envsync/token.json`

### Error Messages
- `✗ Login failed` - Invalid credentials or server error
- `Error: connect ECONNREFUSED` - Server not running

### Use Case
- First-time setup
- After logout
- Token expired
- Switching accounts

### Security Notes
- Password is not displayed (masked with ******)
- Token is stored locally in JSON format
- Token expires based on server configuration (default: 7 days)

---

## 4. `envsync whoami`

### Description
Display information about the currently logged-in user.

### Syntax
```bash
envsync whoami
```

### Options
None

### Example
```bash
envsync whoami
```

### Expected Output (When Logged In)
```
Logged in as: hardikm332004@gmail.com (role: admin)
```

### Expected Output (When Not Logged In)
```
Not logged in
```

### What It Does
1. Reads token from local storage
2. Decodes JWT token
3. Displays user email and role

### User Roles
- **admin** - Full access to all features
- **developer** - Can use runtime injection, cannot view secrets
- **viewer** - Read-only access

### Use Case
- Verify login status
- Check current user role
- Confirm correct account
- Debugging authentication issues

### Error Messages
- `Not logged in` - No token found or invalid token

---

## 5. `envsync logout`

### Description
Clear the stored authentication token and logout from EnvSync.

### Syntax
```bash
envsync logout
```

### Options
None

### Example
```bash
envsync logout
```

### Expected Output
```
✓ Logged out successfully
```

### What It Does
1. Deletes token file from local storage
2. Clears authentication state
3. Displays success message

### Token File Deleted
- **Windows:** `C:\Users\<Username>\.envsync\token.json`
- **Mac/Linux:** `~/.envsync/token.json`

### Use Case
- Switching accounts
- Security best practice (logout when done)
- Clearing expired tokens
- Troubleshooting authentication

### Note
- Does not invalidate token on server (stateless JWT)
- Can logout multiple times without error
- Must login again to use protected commands

---

## 6. `envsync run` (CORE FEATURE)

### Description
Run a command with environment variables injected from EnvSync at runtime. Secrets are decrypted in memory and never written to disk.

### Syntax
```bash
envsync run --project <PROJECT_ID> --env <ENVIRONMENT> <COMMAND> [ARGS...]
```

### Required Options

#### `--project <PROJECT_ID>`
- **Description:** The MongoDB ObjectId of your project
- **Format:** 24-character hexadecimal string
- **Example:** `507f1f77bcf86cd799439011`
- **How to get:** Create project via API, copy the `id` from response

#### `--env <ENVIRONMENT>`
- **Description:** The environment to load secrets from
- **Valid Values:** 
  - `dev` - Development environment
  - `staging` - Staging environment
  - `prod` - Production environment
- **Example:** `dev`, `prod`, `staging`

#### `<COMMAND> [ARGS...]`
- **Description:** The command to run with injected secrets
- **Examples:**
  - `node server.js`
  - `npm start`
  - `npm run dev`
  - `python app.py`
  - Any executable command

### Examples

#### Example 1: Run Node.js Application
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev node server.js
```

#### Example 2: Run npm Script
```bash
envsync run --project 507f1f77bcf86cd799439011 --env prod npm start
```

#### Example 3: Run with npm Development Script
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev npm run dev
```

#### Example 4: Run Python Application
```bash
envsync run --project 507f1f77bcf86cd799439011 --env prod python app.py
```

#### Example 5: Run with Additional Arguments
```bash
envsync run --project 507f1f77bcf86cd799439011 --env dev node server.js --port 3000
```

#### Example 6: MERN Server
```bash
cd server
envsync run --project 507f1f77bcf86cd799439011 --env dev npm start
```

#### Example 7: MERN Client
```bash
cd client
envsync run --project 507f1f77bcf86cd799439011 --env dev npm start
```

### Expected Output
```
⚠️  SECURITY NOTICE:
   Secrets are being injected into your application.
   Logging or exposing these secrets is against security policy.
   All secret access is audited and monitored.

✓ Injected 4 secret(s): DATABASE_URL, API_KEY, JWT_SECRET, PORT

[Your application output follows...]
```

### What It Does

**Step-by-step process:**

1. **Reads stored JWT token** from local file
2. **Validates authentication** - Checks if token exists
3. **Sends API request** to `/api/runtime/secrets` with:
   - Project ID
   - Environment name
   - JWT token in Authorization header
4. **Receives decrypted secrets** as JSON object:
   ```json
   {
     "DATABASE_URL": "mongodb://localhost:27017/db",
     "API_KEY": "sk-1234567890",
     "JWT_SECRET": "secret-key",
     "PORT": "5000"
   }
   ```
5. **Displays security warning** to user
6. **Shows injected secret keys** (not values)
7. **Merges secrets** into `process.env`:
   ```javascript
   const env = { ...process.env, ...secrets };
   ```
8. **Spawns child process** with injected environment:
   ```javascript
   spawn(command, args, { env, stdio: 'inherit' });
   ```
9. **Application runs** with access to secrets via `process.env`
10. **Process exits** when application terminates
11. **Memory cleared** - Secrets garbage collected

### Security Features

✅ **Secrets decrypted in memory only**  
✅ **Never written to disk**  
✅ **Automatic garbage collection**  
✅ **Complete audit trail on server**  
✅ **Security warning displayed**  
✅ **Secret keys shown, values hidden**  

### Error Messages

#### Missing Required Options
```bash
# Missing --project
envsync run --env dev npm start
# Error: required option '--project <id>' not specified

# Missing --env
envsync run --project 507f... npm start
# Error: required option '--env <environment>' not specified

# Missing command
envsync run --project 507f... --env dev
# Error: missing required argument 'cmd'
```

#### Authentication Errors
```bash
# Not logged in
Error fetching secrets: Request failed with status code 401

# Access denied (wrong role)
Error fetching secrets: Request failed with status code 403
Access denied. Only authorized users can access runtime secrets.
```

#### Invalid Parameters
```bash
# Invalid project ID
Error fetching secrets: Request failed with status code 404
# or
Error fetching secrets: Invalid project ID

# Invalid environment
# May return empty secrets or error depending on server
```

#### Network Errors
```bash
# Server not running
Error fetching secrets: connect ECONNREFUSED 127.0.0.1:4000

# Network timeout
Error fetching secrets: timeout of 5000ms exceeded
```

### Use Cases

1. **Local Development**
   ```bash
   envsync run --project myapp --env dev npm run dev
   ```

2. **Staging Testing**
   ```bash
   envsync run --project myapp --env staging npm start
   ```

3. **Production Deployment**
   ```bash
   envsync run --project myapp --env prod npm start
   ```

4. **Multiple Services**
   ```bash
   # Service 1
   envsync run --project service1 --env prod node service1.js
   
   # Service 2
   envsync run --project service2 --env prod node service2.js
   ```

5. **CI/CD Pipeline**
   ```yaml
   - name: Deploy
     run: |
       envsync login
       envsync run --project $PROJECT_ID --env prod npm run deploy
   ```

### Access Control

| User Role | Can Use `envsync run`? |
|-----------|------------------------|
| Admin | ✅ Yes |
| Developer | ✅ Yes |
| Viewer | ❌ No |

### Important Notes

⚠️ **Secrets are accessible in the application**  
- Application code can access `process.env.SECRET_NAME`
- Developers running the app have runtime access to values
- This is by design for the application to function
- All access is audited on the server

⚠️ **Server must be running**  
- EnvSync server must be accessible
- Default: `http://localhost:4000`
- Configure via `ENVSYNC_API_URL` in CLI `.env`

⚠️ **Must be logged in**  
- Run `envsync login` first
- Token must be valid (not expired)

⚠️ **Project and secrets must exist**  
- Project must be created via API
- Secrets must be added for that project/environment
- Empty object returned if no secrets found

### Advanced Usage

#### With Environment-Specific npm Scripts
```json
{
  "scripts": {
    "dev": "envsync run --project ID --env dev npm start",
    "staging": "envsync run --project ID --env staging npm start",
    "prod": "envsync run --project ID --env prod npm start"
  }
}
```

Then simply run:
```bash
npm run dev
npm run staging
npm run prod
```

#### With Aliases (PowerShell)
```powershell
# Add to PowerShell profile
function erun-dev { envsync run --project 507f... --env dev $args }
function erun-prod { envsync run --project 507f... --env prod $args }

# Usage
erun-dev npm start
erun-prod npm start
```

#### With Aliases (Bash/Zsh)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias erun-dev='envsync run --project 507f... --env dev'
alias erun-prod='envsync run --project 507f... --env prod'

# Usage
erun-dev npm start
erun-prod npm start
```

---

## 📊 Command Comparison Table

| Command | Requires Login | Requires Server | Modifies State | Use Frequency |
|---------|---------------|-----------------|----------------|---------------|
| `--version` | ❌ No | ❌ No | ❌ No | Rare |
| `--help` | ❌ No | ❌ No | ❌ No | Occasional |
| `login` | ❌ No | ✅ Yes | ✅ Yes (saves token) | Once per session |
| `whoami` | ⚠️ Optional | ❌ No | ❌ No | Occasional |
| `logout` | ⚠️ Optional | ❌ No | ✅ Yes (deletes token) | Once per session |
| `run` | ✅ Yes | ✅ Yes | ❌ No | Every time |

---

## 🔄 Typical Workflow

```bash
# 1. First time setup
envsync login
# Enter credentials

# 2. Verify login
envsync whoami
# Shows: Logged in as: user@example.com (role: admin)

# 3. Use secrets (multiple times)
envsync run --project 507f... --env dev npm start
envsync run --project 507f... --env dev npm test
envsync run --project 507f... --env staging npm start

# 4. When done (optional)
envsync logout
```

---

## 🎯 Quick Reference

### Most Common Commands

```bash
# Login
envsync login

# Check status
envsync whoami

# Run application
envsync run --project <ID> --env dev npm start

# Logout
envsync logout
```

### Command Shortcuts

```bash
# Get help
envsync -h
envsync --help

# Get version
envsync -V
envsync --version

# Get help for specific command
envsync run --help
```

---

## 💡 Pro Tips

1. **Save Project ID**
   ```bash
   # Create a local file (don't commit!)
   echo "PROJECT_ID=507f1f77bcf86cd799439011" > .envsync-project
   ```

2. **Use npm Scripts**
   ```json
   {
     "scripts": {
       "dev": "envsync run --project $(cat .envsync-project) --env dev npm start"
     }
   }
   ```

3. **Check Token Expiry**
   ```bash
   # If commands start failing with 401
   envsync logout
   envsync login
   ```

4. **Multiple Projects**
   ```bash
   # Use different project IDs for different apps
   envsync run --project frontend-id --env dev npm start
   envsync run --project backend-id --env dev npm start
   ```

5. **Environment Variables**
   ```bash
   # Set default API URL
   # In cli/.env
   ENVSYNC_API_URL=http://localhost:4000/api
   ```

---

## 🔒 Security Best Practices

1. ✅ **Always logout** when switching machines
2. ✅ **Never share** your token file
3. ✅ **Use strong passwords** for your account
4. ✅ **Review audit logs** regularly (admins)
5. ✅ **Don't log secrets** in your application
6. ✅ **Use HTTPS** in production
7. ✅ **Rotate tokens** periodically (re-login)

---

## 📝 Command Exit Codes

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success |
| 1 | General error |
| 401 | Authentication failed |
| 403 | Access denied |
| 404 | Resource not found |

---

*Complete EnvSync CLI Command Reference* 🚀
