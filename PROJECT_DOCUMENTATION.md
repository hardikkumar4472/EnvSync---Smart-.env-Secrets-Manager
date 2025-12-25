# EnvSync - Complete Project Documentation

## 🎯 Project Purpose

**EnvSync** is a secure secrets management system that allows developers to inject environment variables at runtime without ever storing them in plain text on disk. It eliminates the security risks of `.env` files while providing a seamless developer experience.

---

## 🏗️ System Architecture

### Two-Component System:

1. **Server (Backend API)** - Centralized secret storage and management
2. **CLI (Client Tool)** - Command-line interface for developers

---

## 📦 Server Component

### Location: `h:\envSync\server\`

### Technology Stack:
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Encryption**: Node.js crypto (AES-256-GCM)

### Directory Structure:
```
server/
├── src/
│   ├── server.js              # Entry point, DB connection
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── jwt.js             # JWT sign/verify utilities
│   ├── controllers/
│   │   ├── auth.controller.js       # Login logic
│   │   ├── secret.controller.js     # Create/list secrets
│   │   ├── runtime.controller.js    # Runtime secret injection
│   │   ├── project.controller.js    # Project management
│   │   └── audit.controller.js      # Audit log queries
│   ├── models/
│   │   ├── envsync_user.model.js    # User schema
│   │   ├── secret.model.js          # Secret schema
│   │   ├── project.model.js         # Project schema
│   │   └── audit-log.model.js       # Audit log schema
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   └── rbac.middleware.js       # Role-based access control
│   ├── routes/
│   │   ├── auth.routes.js           # POST /api/auth/login
│   │   ├── secret.routes.js         # Secret CRUD operations
│   │   ├── runtime.routes.js        # POST /api/runtime/secrets
│   │   ├── project.routes.js        # Project management
│   │   ├── audit.routes.js          # Audit log access
│   │   ├── admin.route.js           # Admin operations
│   │   └── protected.routes.js      # Protected endpoints
│   └── utils/
│       ├── encryption.js            # AES-256-GCM encrypt/decrypt
│       └── audit.js                 # Audit logging utility
└── scripts/
    └── create_user.js               # Initial user creation script
```

### API Endpoints:

#### Authentication
- `POST /api/auth/login` - User login, returns JWT token

#### Secrets Management
- `POST /api/secrets` - Create encrypted secret (admin only)
- `GET /api/secrets?projectId=X&environment=Y` - List secrets (admin/developer)

#### Runtime Injection (Core Feature)
- `POST /api/runtime/secrets` - Fetch decrypted secrets for runtime injection

#### Projects
- Project CRUD operations for organizing secrets

#### Audit
- Query audit logs for security compliance

### Database Models:

#### User Model (`envsync_user`)
```javascript
{
  email: String (unique, required),
  password: String (hashed with bcrypt, select: false),
  role: String (enum: ['admin', 'developer', 'viewer']),
  isActive: Boolean,
  timestamps: true
}
```

#### Secret Model
```javascript
{
  projectId: ObjectId (ref: 'Project'),
  environment: String (enum: ['dev', 'staging', 'prod']),
  key: String (e.g., 'DATABASE_URL'),
  encryptedValue: {
    iv: String,      // Initialization vector
    content: String, // Encrypted data
    tag: String      // Authentication tag
  },
  createdBy: ObjectId (ref: 'User'),
  timestamps: true
}
// Unique index: projectId + environment + key
```

#### Project Model
```javascript
{
  name: String (unique, required),
  description: String,
  isActive: Boolean,
  timestamps: true
}
```

### Security Implementation:

#### 1. Password Security
- Passwords hashed with bcrypt (cost factor: 12)
- Pre-save hook automatically hashes passwords
- Password field excluded from queries by default (`select: false`)

#### 2. Encryption (AES-256-GCM)
```javascript
// Encryption Process:
1. Generate random 12-byte IV
2. Derive 32-byte key from SECRET_MASTER_KEY using SHA-256
3. Encrypt plaintext with AES-256-GCM
4. Store: { iv, content, tag }

// Decryption Process:
1. Retrieve encrypted data from DB
2. Use same master key
3. Verify authentication tag
4. Decrypt in memory only
5. Return plaintext
6. Let garbage collector clear memory
```

#### 3. Authentication Flow
```
1. User sends email + password
2. Server finds user, selects password field
3. bcrypt.compare(plainPassword, hashedPassword)
4. If valid, generate JWT with { id, role }
5. Return token to client
6. Client includes token in Authorization header
7. Middleware verifies token on each request
```

#### 4. Role-Based Access Control (RBAC)
- **Admin**: Full access (create secrets, manage users)
- **Developer**: Read secrets, access runtime injection
- **Viewer**: Read-only access

#### 5. Audit Logging
Every sensitive action is logged:
- LOGIN
- SECRET_CREATE
- RUNTIME_SECRET_ACCESS
- Includes: user, action, timestamp, IP address, project, environment

---

## 🖥️ CLI Component

### Location: `h:\envSync\cli\`

### Technology Stack:
- **CLI Framework**: Commander.js
- **HTTP Client**: Axios
- **Terminal Colors**: Chalk
- **Environment**: dotenv

### Directory Structure:
```
cli/
├── bin/
│   └── envsync.js              # CLI entry point (executable)
├── src/
│   ├── commands/
│   │   ├── login.js            # Login command
│   │   ├── logout.js           # Logout command
│   │   ├── whoami.js           # Show current user
│   │   └── run.js              # Runtime injection command
│   └── services/
│       ├── api.js              # Axios instance with auth interceptor
│       └── token.store.js      # Local token storage
└── package.json
```

### Commands:

#### 1. `envsync login`
```bash
$ envsync login
Email: admin@example.com
Password: ******
✓ Logged in successfully
```
**What it does:**
- Prompts for email and password
- Sends POST request to `/api/auth/login`
- Saves JWT token locally (in `~/.envsync` or similar)

#### 2. `envsync whoami`
```bash
$ envsync whoami
Logged in as: admin@example.com (role: admin)
```
**What it does:**
- Reads stored token
- Displays current user info

#### 3. `envsync logout`
```bash
$ envsync logout
✓ Logged out successfully
```
**What it does:**
- Deletes stored JWT token

#### 4. `envsync run` (Main Feature)
```bash
$ envsync run --project 507f1f77bcf86cd799439011 --env prod node server.js
```
**What it does:**
1. Reads stored JWT token
2. Sends POST to `/api/runtime/secrets` with projectId and environment
3. Receives decrypted secrets as JSON: `{ "DATABASE_URL": "...", "API_KEY": "..." }`
4. Merges secrets into `process.env`
5. Spawns child process with injected environment
6. Runs the specified command (e.g., `node server.js`)
7. **Secrets never written to disk!**

### API Service (`api.js`)
```javascript
// Axios instance with automatic JWT injection
const api = axios.create({
  baseURL: process.env.ENVSYNC_API_URL || 'http://localhost:4000/api'
});

// Interceptor adds Authorization header to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 🔄 Complete Workflows

### Workflow 1: Initial Setup

```
1. Admin sets up server:
   - Configure MongoDB connection (MONGO_URI in .env)
   - Set SECRET_MASTER_KEY for encryption
   - Start server: node src/server.js

2. Admin creates first user:
   - Run: node scripts/create_user.js
   - User created with email: hardikm332004@gmail.com
   - Password hashed and stored in MongoDB

3. Developer installs CLI:
   - npm install -g envsync (or local install)
```

### Workflow 2: Developer Authentication

```
Developer Terminal:
$ envsync login
Email: hardikm332004@gmail.com
Password: 123456

Server Process:
1. Receives login request
2. Finds user by email
3. Compares password with bcrypt
4. Generates JWT: { id: "...", role: "admin" }
5. Returns token

CLI Process:
1. Receives token
2. Saves to ~/.envsync/token
3. Shows success message
```

### Workflow 3: Storing Secrets (Admin)

```
Admin uses API (via Postman/curl):
POST /api/secrets
Authorization: Bearer <jwt_token>
{
  "projectId": "507f1f77bcf86cd799439011",
  "environment": "prod",
  "key": "DATABASE_URL",
  "value": "mongodb://prod-server:27017/mydb"
}

Server Process:
1. Auth middleware verifies JWT
2. RBAC middleware checks role (admin required)
3. Controller receives request
4. Encryption utility:
   - Generates random IV
   - Encrypts value with AES-256-GCM
   - Returns { iv, content, tag }
5. Saves to MongoDB:
   {
     projectId: "507f1f77bcf86cd799439011",
     environment: "prod",
     key: "DATABASE_URL",
     encryptedValue: { iv: "...", content: "...", tag: "..." },
     createdBy: "admin_user_id"
   }
6. Logs audit: SECRET_CREATE
7. Returns success
```

### Workflow 4: Runtime Secret Injection (Developer)

```
Developer Terminal:
$ envsync run --project 507f1f77bcf86cd799439011 --env prod node app.js

CLI Process:
1. Reads JWT token from ~/.envsync/token
2. Sends POST to /api/runtime/secrets:
   {
     "projectId": "507f1f77bcf86cd799439011",
     "environment": "prod"
   }

Server Process:
1. Auth middleware verifies JWT
2. Controller queries MongoDB:
   Secret.find({ projectId: "...", environment: "prod" })
3. Receives encrypted secrets
4. Decrypts each secret IN MEMORY:
   for (secret of secrets) {
     runtimeSecrets[secret.key] = decrypt(secret.encryptedValue);
   }
5. Returns JSON:
   {
     "DATABASE_URL": "mongodb://prod-server:27017/mydb",
     "API_KEY": "sk-1234567890abcdef",
     "JWT_SECRET": "super-secret-key"
   }
6. Logs audit: RUNTIME_SECRET_ACCESS
7. ⚠️ Secrets cleared from memory after response

CLI Process:
1. Receives decrypted secrets
2. Merges into environment:
   const env = { ...process.env, ...res.data };
3. Spawns child process:
   spawn('node', ['app.js'], { env, stdio: 'inherit' })

Application Process:
1. Runs with injected environment variables
2. Can access process.env.DATABASE_URL, etc.
3. When process ends, secrets are garbage collected
4. ✅ Secrets never written to .env file or disk!
```

---

## 🔐 Security Features Summary

### ✅ What EnvSync Does Right:

1. **Encryption at Rest**
   - All secrets encrypted with AES-256-GCM
   - Unique IV for each secret
   - Authentication tags ensure integrity

2. **No Plaintext Storage**
   - Secrets never stored in plain text
   - No `.env` files with sensitive data
   - Passwords hashed with bcrypt

3. **Runtime-Only Decryption**
   - Secrets decrypted only in memory
   - Never logged or written to disk
   - Automatically garbage collected

4. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Token expiration

5. **Audit Trail**
   - All secret access logged
   - Includes user, action, timestamp, IP
   - Compliance and security monitoring

6. **Principle of Least Privilege**
   - Admins: Create/manage secrets
   - Developers: Read and use secrets
   - Viewers: Read-only access

---

## 🚀 Usage Examples

### Example 1: Setting Up a New Project

```bash
# 1. Admin creates project (via API)
POST /api/projects
{ "name": "MyWebApp", "description": "Production web application" }
# Returns: { "id": "507f1f77bcf86cd799439011" }

# 2. Admin adds secrets for different environments
POST /api/secrets
{ "projectId": "507f...", "environment": "dev", "key": "DB_URL", "value": "mongodb://localhost/dev" }

POST /api/secrets
{ "projectId": "507f...", "environment": "prod", "key": "DB_URL", "value": "mongodb://prod-server/prod" }

POST /api/secrets
{ "projectId": "507f...", "environment": "prod", "key": "API_KEY", "value": "sk-prod-key-123" }

# 3. Developer logs in
$ envsync login

# 4. Developer runs app with dev secrets
$ envsync run --project 507f1f77bcf86cd799439011 --env dev npm run dev

# 5. In production, run with prod secrets
$ envsync run --project 507f1f77bcf86cd799439011 --env prod npm start
```

### Example 2: Application Code

```javascript
// app.js - Your application code
// No changes needed! Just access environment variables normally

const mongoose = require('mongoose');

// This works because EnvSync injected DATABASE_URL at runtime
mongoose.connect(process.env.DATABASE_URL);

const apiKey = process.env.API_KEY;
const jwtSecret = process.env.JWT_SECRET;

// Your app runs normally, but secrets came from EnvSync, not .env file!
```

---

## 🎯 Key Benefits

### 1. **Security**
- No plaintext secrets in version control
- No `.env` files to accidentally commit
- Encrypted storage with industry-standard algorithms

### 2. **Convenience**
- Seamless developer experience
- No code changes required
- Works with any application

### 3. **Compliance**
- Audit trail for all secret access
- Role-based access control
- Centralized secret management

### 4. **Flexibility**
- Multiple environments (dev, staging, prod)
- Multiple projects
- Team collaboration

---

## 📊 Data Flow Summary

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ envsync login
       ▼
┌─────────────┐      JWT Token      ┌─────────────┐
│     CLI     │◄────────────────────│   Server    │
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       │ envsync run --project X --env Y   │
       │────────────────────────────────►  │
       │                                   │ Query MongoDB
       │                                   ▼
       │                            ┌─────────────┐
       │                            │   Secrets   │
       │                            │ (Encrypted) │
       │                            └──────┬──────┘
       │                                   │
       │                                   │ Decrypt in RAM
       │   Decrypted Secrets (JSON)        ▼
       │◄──────────────────────────────────┤
       │                                   │
       │ Inject into process.env           │ Log Audit
       ▼                                   ▼
┌─────────────┐                     ┌─────────────┐
│ Application │                     │  Audit Log  │
│   Running   │                     └─────────────┘
└─────────────┘
```

---

## 🔧 Configuration

### Server `.env` File:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/envsync
SECRET_MASTER_KEY=your-super-secret-master-key-here
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
```

### CLI Configuration:
```env
ENVSYNC_API_URL=http://localhost:4000/api
```

---

## 🎓 Technical Highlights

### 1. **Encryption Implementation**
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: SHA-256 hash of master key
- **IV**: Random 12 bytes per secret
- **Authentication**: GCM provides built-in authentication tag

### 2. **JWT Implementation**
- **Payload**: `{ id: userId, role: userRole }`
- **Signing**: HMAC-SHA256
- **Expiration**: Configurable (default: 7 days)

### 3. **Password Hashing**
- **Algorithm**: bcrypt
- **Cost Factor**: 12 (2^12 iterations)
- **Salt**: Automatically generated per password

### 4. **Database Indexing**
- Unique index on: `projectId + environment + key`
- Prevents duplicate secrets
- Optimizes queries

---

## 🚨 Important Security Notes

### ⚠️ Critical Points:

1. **Master Key Protection**
   - `SECRET_MASTER_KEY` must be kept secure
   - If compromised, all secrets can be decrypted
   - Rotate regularly in production

2. **JWT Secret Protection**
   - `JWT_SECRET` must be kept secure
   - If compromised, attackers can forge tokens

3. **Network Security**
   - Use HTTPS in production
   - Secrets transmitted over network during runtime injection
   - Consider VPN or private network

4. **Access Control**
   - Limit admin access
   - Review audit logs regularly
   - Implement IP whitelisting if needed

5. **Memory Security**
   - Secrets exist in memory during runtime
   - Memory dumps could expose secrets
   - Use secure hosting environments

---

## 🎉 Conclusion

**EnvSync** is a production-ready secrets management system that solves the common problem of environment variable security. By combining encrypted storage, runtime injection, and comprehensive auditing, it provides a secure and developer-friendly solution for managing sensitive configuration data.

### Core Innovation:
**Secrets are decrypted only in memory at runtime and never written to disk**, eliminating the risk of accidental exposure through version control or file system access.

---

## 📚 Additional Resources

- **MongoDB**: https://www.mongodb.com/docs/
- **JWT**: https://jwt.io/
- **AES-GCM**: https://en.wikipedia.org/wiki/Galois/Counter_Mode
- **bcrypt**: https://github.com/kelektiv/node.bcrypt.js
- **Commander.js**: https://github.com/tj/commander.js

---

*Generated: 2025-12-25*
*Project: EnvSync - Secure Runtime Secret Injection*
