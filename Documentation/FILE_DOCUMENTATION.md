# EnvSync - Complete File Documentation

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Server Files](#server-files)
3. [CLI Files](#cli-files)
4. [Configuration Files](#configuration-files)
5. [File Dependencies](#file-dependencies)

---

## 🏗️ Project Structure

```
envSync/
├── server/                          # Backend API
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── app.js                  # Express app configuration
│   │   ├── config/                 # Configuration files
│   │   ├── controllers/            # Business logic
│   │   ├── middleware/             # Authentication & authorization
│   │   ├── models/                 # Database schemas
│   │   ├── routes/                 # API route definitions
│   │   └── utils/                  # Utility functions
│   ├── scripts/                    # Utility scripts
│   ├── .env                        # Environment variables
│   └── package.json                # Dependencies
│
├── cli/                            # Command-line interface
│   ├── bin/
│   │   └── envsync.js             # CLI entry point
│   ├── src/
│   │   ├── commands/              # CLI commands
│   │   └── services/              # API client & utilities
│   ├── .env                       # CLI configuration
│   └── package.json               # Dependencies
│
└── Documentation/                  # Project documentation
    ├── PROJECT_DOCUMENTATION.md
    ├── TESTING_GUIDE.md
    ├── MERN_TESTING_GUIDE.md
    └── POSTMAN_TESTING_GUIDE.md
```

---

## 🖥️ Server Files

### 📁 Root Level Files

#### `server/src/server.js`
**Purpose:** Application entry point and database connection

**What it contains:**
- MongoDB connection logic
- Server startup configuration
- Environment variable loading
- Error handling for database connection failures

**Key Functions:**
- Connects to MongoDB using `MONGO_URI` from `.env`
- Starts Express server on specified `PORT`
- Handles connection errors and exits gracefully

**Dependencies:**
- `dotenv` - Load environment variables
- `mongoose` - MongoDB ODM
- `./app.js` - Express application

**Code Flow:**
```
1. Load .env variables
2. Import Express app
3. Connect to MongoDB
4. If successful → Start server
5. If failed → Log error and exit
```

**Environment Variables Used:**
- `PORT` - Server port (default: 4000)
- `MONGO_URI` - MongoDB connection string

---

#### `server/src/app.js`
**Purpose:** Express application configuration and middleware setup

**What it contains:**
- Express app initialization
- Middleware configuration (JSON parsing)
- Route mounting
- Health check endpoint

**Routes Mounted:**
- `/api/auth` → Authentication routes
- `/api/protected` → Protected routes
- `/api/admin` → Admin-only routes
- `/api/secrets` → Secret management
- `/api/runtime` → Runtime secret injection
- `/api/audit` → Audit log access
- `/api/projects` → Project management

**Middleware:**
- `express.json()` - Parse JSON request bodies

**Health Check:**
- `GET /health` - Returns server status

**Exports:** Express app instance

---

### 📁 config/

#### `server/src/config/jwt.js`
**Purpose:** JWT token generation and verification utilities

**What it contains:**
- `signToken(payload)` - Creates JWT tokens
- `verifyToken(token)` - Validates and decodes JWT tokens

**Key Functions:**

**`signToken(payload)`**
- Input: `{ id, role }`
- Output: JWT token string
- Uses: `JWT_SECRET` and `JWT_EXPIRES_IN` from env

**`verifyToken(token)`**
- Input: JWT token string
- Output: Decoded payload `{ id, role }`
- Throws error if invalid/expired

**Environment Variables:**
- `JWT_SECRET` - Secret key for signing
- `JWT_EXPIRES_IN` - Token expiration time (e.g., "7d")

**Dependencies:**
- `jsonwebtoken` - JWT library

---

### 📁 controllers/

#### `server/src/controllers/auth.controller.js`
**Purpose:** Handle user authentication

**What it contains:**
- `login(req, res)` - User login endpoint handler

**Login Flow:**
```
1. Extract email and password from request body
2. Validate required fields
3. Find user by email (include password field)
4. Check if user exists and is active
5. Compare password using bcrypt
6. If valid → Generate JWT token
7. Log audit trail (LOGIN action)
8. Return token and user info
9. If invalid → Return 401 error
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "...",
    "role": "admin"
  }
}
```

**Dependencies:**
- `User` model
- `signToken` from jwt config
- `logAudit` utility

---

#### `server/src/controllers/secret.controller.js`
**Purpose:** Manage encrypted secrets (CRUD operations)

**What it contains:**

**1. `createSecret(req, res)` - Create new encrypted secret**

**Flow:**
```
1. Extract projectId, environment, key, value from request
2. Validate all required fields
3. Encrypt the value using AES-256-GCM
4. Create secret document in MongoDB
5. Log audit trail (SECRET_CREATE)
6. Return success with secret ID
```

**Request:**
```json
{
  "projectId": "507f...",
  "environment": "dev",
  "key": "DATABASE_URL",
  "value": "mongodb://..."
}
```

**Response:**
```json
{
  "message": "Secret stored securely",
  "secretId": "67890..."
}
```

**2. `listSecrets(req, res)` - List secret metadata (ADMIN ONLY)**

**Flow:**
```
1. Extract projectId and environment from query params
2. Validate required parameters
3. Query MongoDB for matching secrets
4. Return ONLY metadata (no encrypted values)
5. Sort by creation date (newest first)
```

**Query Params:**
- `projectId` - Project ID
- `environment` - Environment (dev/staging/prod)

**Response:**
```json
{
  "count": 3,
  "secrets": [
    {
      "_id": "...",
      "key": "DATABASE_URL",
      "environment": "dev",
      "projectId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Note:** Encrypted values are NOT returned!

**3. `getSecretValue(req, res)` - Get decrypted secret (ADMIN ONLY - NEW)**

**Flow:**
```
1. Extract secretId from URL params
2. Find secret in database
3. Decrypt the encrypted value
4. Log audit trail (SECRET_VIEW)
5. Return decrypted value
```

**Response:**
```json
{
  "key": "DATABASE_URL",
  "value": "mongodb://localhost:27017/db",
  "environment": "dev",
  "projectId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Security:** Only admins can access this endpoint!

**Dependencies:**
- `Secret` model
- `encrypt/decrypt` utilities
- `logAudit` utility

---

#### `server/src/controllers/runtime.controller.js`
**Purpose:** Runtime secret injection (core feature)

**What it contains:**
- `getRuntimeSecrets(req, res)` - Fetch and decrypt secrets for runtime use

**Flow:**
```
1. Extract projectId and environment from request body
2. Validate required fields
3. Query MongoDB for all matching secrets
4. If no secrets found → Return empty object
5. Decrypt each secret IN MEMORY ONLY
6. Build key-value object: { KEY: decrypted_value }
7. Log audit trail (RUNTIME_SECRET_ACCESS)
8. Return decrypted secrets
9. ⚠️ Secrets cleared from memory after response
```

**Request:**
```json
{
  "projectId": "507f...",
  "environment": "prod"
}
```

**Response:**
```json
{
  "DATABASE_URL": "mongodb://prod:27017/db",
  "API_KEY": "sk-prod-key",
  "JWT_SECRET": "prod-secret"
}
```

**⚠️ CRITICAL SECURITY NOTES:**
- Secrets are decrypted ONLY in RAM
- Secrets are NEVER logged
- Secrets are NEVER stored in plain text
- After response, variables go out of scope
- Garbage collector clears memory
- All access is audited

**Dependencies:**
- `Secret` model
- `decrypt` utility
- `logAudit` utility

---

#### `server/src/controllers/project.controller.js`
**Purpose:** Project management (CRUD operations)

**What it contains:**
- Create, read, update, delete projects
- Projects organize secrets by application

**Typical Functions:**
- `createProject` - Create new project
- `listProjects` - Get all projects
- `getProject` - Get single project
- `updateProject` - Update project details
- `deleteProject` - Soft delete project

**Dependencies:**
- `Project` model

---

#### `server/src/controllers/audit.controller.js`
**Purpose:** Audit log querying

**What it contains:**
- Query and filter audit logs
- Security compliance reporting

**Typical Functions:**
- `getAuditLogs` - Retrieve audit logs with filters
- Filter by: user, action, date range, project

**Dependencies:**
- `AuditLog` model

---

### 📁 middleware/

#### `server/src/middleware/auth.middleware.js`
**Purpose:** JWT authentication middleware

**What it contains:**
- Middleware function to verify JWT tokens

**Flow:**
```
1. Extract Authorization header
2. Check if header exists and starts with "Bearer "
3. Extract token from header
4. Verify token using JWT secret
5. If valid → Decode payload and attach to req.user
6. Call next() to proceed to next middleware
7. If invalid → Return 401 Unauthorized
```

**Usage:**
```javascript
router.get('/protected', auth, (req, res) => {
  // req.user is available here
  // Contains: { id, role }
});
```

**Request Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Sets:**
- `req.user` - Decoded token payload `{ id, role }`

**Dependencies:**
- `verifyToken` from jwt config

---

#### `server/src/middleware/rbac.middleware.js`
**Purpose:** Role-Based Access Control

**What it contains:**
- Middleware factory function for role checking

**Flow:**
```
1. Accept array of allowed roles
2. Return middleware function
3. Check if req.user exists (must run after auth middleware)
4. Check if user's role is in allowed roles
5. If allowed → Call next()
6. If not allowed → Return 403 Forbidden
```

**Usage:**
```javascript
// Only admins can access
router.post('/secrets', auth, rbac('admin'), createSecret);

// Admins and developers can access
router.get('/projects', auth, rbac('admin', 'developer'), listProjects);
```

**Roles:**
- `admin` - Full access
- `developer` - Limited access
- `viewer` - Read-only access

**Dependencies:**
- None (pure function)

---

### 📁 models/

#### `server/src/models/envsync_user.model.js`
**Purpose:** User database schema

**What it contains:**
- Mongoose schema for users
- Password hashing pre-save hook
- Password comparison method

**Schema Fields:**
```javascript
{
  email: String (unique, required, lowercase, trimmed),
  password: String (required, select: false),
  role: String (enum: ['admin', 'developer', 'viewer'], default: 'developer'),
  isActive: Boolean (default: true),
  timestamps: true (createdAt, updatedAt)
}
```

**Pre-save Hook:**
```javascript
// Automatically hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

**Instance Methods:**

**`comparePassword(plainPassword)`**
- Compares plain password with hashed password
- Returns: Promise<boolean>
- Used during login

**Security Features:**
- Password field excluded by default (`select: false`)
- Must explicitly request password: `User.findOne().select('+password')`
- Bcrypt cost factor: 12 (2^12 iterations)

**Dependencies:**
- `mongoose` - ODM
- `bcrypt` - Password hashing

---

#### `server/src/models/secret.model.js`
**Purpose:** Encrypted secret storage schema

**What it contains:**
- Mongoose schema for secrets
- Unique compound index

**Schema Fields:**
```javascript
{
  projectId: ObjectId (ref: 'Project', required),
  environment: String (enum: ['dev', 'staging', 'prod'], required),
  key: String (required),
  encryptedValue: {
    iv: String,      // Initialization vector
    content: String, // Encrypted data
    tag: String      // Authentication tag
  },
  createdBy: ObjectId (ref: 'User'),
  timestamps: true
}
```

**Indexes:**
```javascript
// Unique index on projectId + environment + key
// Prevents duplicate secrets
{ projectId: 1, environment: 1, key: 1 }, { unique: true }
```

**Example Document:**
```json
{
  "_id": "67890...",
  "projectId": "507f...",
  "environment": "prod",
  "key": "DATABASE_URL",
  "encryptedValue": {
    "iv": "a3f2b1c4d5e6f7g8h9i0",
    "content": "8b4c9d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    "tag": "9e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b"
  },
  "createdBy": "user123",
  "createdAt": "2025-12-25T01:00:00.000Z",
  "updatedAt": "2025-12-25T01:00:00.000Z"
}
```

**Dependencies:**
- `mongoose` - ODM

---

#### `server/src/models/project.model.js`
**Purpose:** Project organization schema

**What it contains:**
- Mongoose schema for projects

**Schema Fields:**
```javascript
{
  name: String (required, unique),
  description: String,
  isActive: Boolean (default: true),
  timestamps: true
}
```

**Purpose:**
- Organize secrets by application/project
- Enable multi-project support
- Soft delete capability (isActive flag)

**Dependencies:**
- `mongoose` - ODM

---

#### `server/src/models/audit-log.model.js`
**Purpose:** Security audit trail schema

**What it contains:**
- Mongoose schema for audit logs

**Schema Fields:**
```javascript
{
  user: {
    id: ObjectId,
    role: String
  },
  action: String (e.g., 'LOGIN', 'SECRET_CREATE', 'RUNTIME_SECRET_ACCESS'),
  projectId: ObjectId (optional),
  environment: String (optional),
  metadata: Object (optional, additional context),
  ipAddress: String,
  timestamp: Date (default: now)
}
```

**Common Actions:**
- `LOGIN` - User authentication
- `SECRET_CREATE` - New secret created
- `SECRET_VIEW` - Admin viewed secret value
- `RUNTIME_SECRET_ACCESS` - Secrets fetched for runtime
- `PROJECT_CREATE` - New project created

**Purpose:**
- Security compliance
- Track all sensitive operations
- Forensic analysis
- Detect unauthorized access

**Dependencies:**
- `mongoose` - ODM

---

### 📁 routes/

#### `server/src/routes/auth.routes.js`
**Purpose:** Authentication route definitions

**What it contains:**
- POST `/login` - User login

**Routes:**
```javascript
router.post('/login', login);
```

**No authentication required** - Public endpoint

**Dependencies:**
- `auth.controller.js`

---

#### `server/src/routes/secret.routes.js`
**Purpose:** Secret management route definitions

**What it contains:**
- Routes for secret CRUD operations

**Routes:**
```javascript
// Create secret (admin only)
router.post('/', auth, rbac('admin'), createSecret);

// List secrets (admin only - UPDATED)
router.get('/', auth, rbac('admin'), listSecrets);

// Get secret value (admin only - NEW)
router.get('/:secretId/value', auth, rbac('admin'), getSecretValue);
```

**Security:**
- All routes require authentication (`auth` middleware)
- All routes require admin role (`rbac('admin')`)
- Developers CANNOT access these routes

**Dependencies:**
- `secret.controller.js`
- `auth.middleware.js`
- `rbac.middleware.js`

---

#### `server/src/routes/runtime.routes.js`
**Purpose:** Runtime secret injection routes

**What it contains:**
- POST `/secrets` - Get decrypted secrets for runtime

**Routes:**
```javascript
router.post('/secrets', auth, getRuntimeSecrets);
```

**Access:**
- Requires authentication
- Available to all authenticated users (admin, developer)
- This is how CLI gets secrets

**Dependencies:**
- `runtime.controller.js`
- `auth.middleware.js`

---

#### `server/src/routes/project.routes.js`
**Purpose:** Project management routes

**What it contains:**
- CRUD routes for projects

**Typical Routes:**
```javascript
router.post('/', auth, rbac('admin'), createProject);
router.get('/', auth, listProjects);
router.get('/:id', auth, getProject);
router.put('/:id', auth, rbac('admin'), updateProject);
router.delete('/:id', auth, rbac('admin'), deleteProject);
```

**Dependencies:**
- `project.controller.js`
- `auth.middleware.js`
- `rbac.middleware.js`

---

#### `server/src/routes/audit.routes.js`
**Purpose:** Audit log query routes

**What it contains:**
- GET `/` - Query audit logs

**Routes:**
```javascript
router.get('/', auth, rbac('admin'), getAuditLogs);
```

**Access:** Admin only

**Dependencies:**
- `audit.controller.js`
- `auth.middleware.js`
- `rbac.middleware.js`

---

#### `server/src/routes/admin.route.js`
**Purpose:** Admin-specific operations

**What it contains:**
- User management
- System configuration

**Access:** Admin only

---

#### `server/src/routes/protected.routes.js`
**Purpose:** General protected routes

**What it contains:**
- Routes requiring authentication
- User profile, settings, etc.

---

### 📁 utils/

#### `server/src/utils/encryption.js`
**Purpose:** AES-256-GCM encryption/decryption

**What it contains:**

**Constants:**
- `ALGORITHM` - "aes-256-gcm"
- `IV_LENGTH` - 12 bytes
- `MASTER_KEY` - Derived from `SECRET_MASTER_KEY` env variable

**Functions:**

**`encrypt(plainText)`**
```
Input: Plain text string
Output: { iv, content, tag }

Process:
1. Generate random 12-byte IV
2. Create cipher with AES-256-GCM
3. Encrypt plaintext
4. Get authentication tag
5. Return { iv, content, tag } as hex strings
```

**`decrypt(encryptedData)`**
```
Input: { iv, content, tag }
Output: Plain text string

Process:
1. Create decipher with same algorithm
2. Set authentication tag
3. Decrypt content
4. Return plain text
```

**Security:**
- AES-256-GCM provides encryption + authentication
- Unique IV per secret (prevents pattern analysis)
- Authentication tag ensures data integrity
- Master key derived using SHA-256

**Master Key Derivation:**
```javascript
const MASTER_KEY = crypto
  .createHash('sha256')
  .update(process.env.SECRET_MASTER_KEY)
  .digest(); // Always 32 bytes
```

**Dependencies:**
- `crypto` - Node.js built-in

---

#### `server/src/utils/audit.js`
**Purpose:** Audit logging utility

**What it contains:**
- `logAudit(data)` - Create audit log entry

**Function:**
```javascript
logAudit({
  user: { id, role },
  action: 'ACTION_NAME',
  projectId: '...',
  environment: 'dev',
  metadata: { ... },
  ipAddress: '...'
})
```

**Returns:** Promise (async operation)

**Usage:**
```javascript
await logAudit({
  user: req.user,
  action: 'SECRET_CREATE',
  projectId: secret.projectId,
  environment: secret.environment,
  ipAddress: req.ip
});
```

**Dependencies:**
- `AuditLog` model

---

### 📁 scripts/

#### `server/scripts/create_user.js`
**Purpose:** Create initial admin user

**What it contains:**
- Script to create first admin user
- Database connection
- User creation logic

**Flow:**
```
1. Load environment variables
2. Connect to MongoDB
3. Define user data (email, password, role)
4. Check if user already exists
5. If exists → Log message and exit
6. If not exists → Create user
7. Password automatically hashed by pre-save hook
8. Disconnect from MongoDB
9. Exit process
```

**Default User:**
```javascript
{
  email: 'hardikm332004@gmail.com',
  password: '123456',
  role: 'admin'
}
```

**Usage:**
```bash
node scripts/create_user.js
```

**Note:** Modify email/password before running in production!

**Dependencies:**
- `dotenv` - Load .env
- `mongoose` - Database
- `User` model

---

## 💻 CLI Files

### 📁 bin/

#### `cli/bin/envsync.js`
**Purpose:** CLI entry point and command definitions

**What it contains:**
- Shebang for executable (`#!/usr/bin/env node`)
- Commander.js program setup
- Command definitions

**Commands Defined:**

**1. `envsync login`**
```javascript
program
  .command('login')
  .description('Login to EnvSync')
  .action(require('../src/commands/login'));
```

**2. `envsync whoami`**
```javascript
program
  .command('whoami')
  .description('Show current user')
  .action(require('../src/commands/whoami'));
```

**3. `envsync logout`**
```javascript
program
  .command('logout')
  .description('Logout')
  .action(require('../src/commands/logout'));
```

**4. `envsync run`**
```javascript
program
  .command('run')
  .description('Run command with runtime secrets')
  .allowUnknownOption(true)
  .passThroughOptions()
  .requiredOption('--project <id>')
  .requiredOption('--env <environment>')
  .argument('<cmd...>')
  .action(require('../src/commands/run'));
```

**Program Configuration:**
- Name: "envsync"
- Version: "1.0.0"
- Description: "Runtime-only secret injection CLI"

**Dependencies:**
- `commander` - CLI framework
- `dotenv` - Environment variables

---

### 📁 commands/

#### `cli/src/commands/login.js`
**Purpose:** User login command

**What it contains:**
- Interactive login prompt
- API call to login endpoint
- Token storage

**Flow:**
```
1. Create readline interface
2. Prompt for email
3. Prompt for password
4. Close readline
5. Send POST to /auth/login
6. If successful → Save token locally
7. Display success message
8. If failed → Display error message
```

**User Interaction:**
```
$ envsync login
Email: admin@example.com
Password: ******
✓ Logged in successfully
```

**Dependencies:**
- `api` service - HTTP client
- `saveToken` from token.store
- `chalk` - Colored output
- `readline` - User input

---

#### `cli/src/commands/whoami.js`
**Purpose:** Show current logged-in user

**What it contains:**
- Read stored token
- Decode and display user info

**Flow:**
```
1. Get token from local storage
2. If no token → Display "Not logged in"
3. If token exists → Decode JWT
4. Display user email and role
```

**Output:**
```
Logged in as: admin@example.com (role: admin)
```

**Dependencies:**
- `getToken` from token.store
- `chalk` - Colored output

---

#### `cli/src/commands/logout.js`
**Purpose:** Logout and clear token

**What it contains:**
- Delete stored token

**Flow:**
```
1. Delete token from local storage
2. Display success message
```

**Output:**
```
✓ Logged out successfully
```

**Dependencies:**
- `deleteToken` from token.store
- `chalk` - Colored output

---

#### `cli/src/commands/run.js`
**Purpose:** Runtime secret injection (CORE FEATURE)

**What it contains:**
- Fetch secrets from API
- Inject into environment
- Spawn child process

**Flow:**
```
1. Extract project ID and environment from options
2. Send POST to /runtime/secrets
3. Receive decrypted secrets
4. Display security warning
5. Display injected secret keys (not values)
6. Merge secrets into process.env
7. Spawn child process with injected environment
8. Pass through stdio (inherit)
9. Exit when child process exits
10. Handle errors (403, network, etc.)
```

**Usage:**
```bash
envsync run --project 507f... --env dev npm start
```

**Security Warning Displayed:**
```
⚠️  SECURITY NOTICE:
   Secrets are being injected into your application.
   Logging or exposing these secrets is against security policy.
   All secret access is audited and monitored.

✓ Injected 4 secret(s): DATABASE_URL, API_KEY, JWT_SECRET, PORT
```

**Error Handling:**
- Network errors
- 403 Forbidden (access denied)
- Invalid project/environment

**Dependencies:**
- `spawn` from child_process
- `api` service
- `chalk` - Colored output

---

### 📁 services/

#### `cli/src/services/api.js`
**Purpose:** HTTP client with authentication

**What it contains:**
- Axios instance with base URL
- Request interceptor for JWT injection

**Configuration:**
```javascript
const api = axios.create({
  baseURL: process.env.ENVSYNC_API_URL || 'http://localhost:4000/api'
});
```

**Request Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Automatically adds:**
- `Authorization: Bearer <token>` header to all requests

**Usage:**
```javascript
const response = await api.post('/runtime/secrets', {
  projectId: '...',
  environment: 'dev'
});
```

**Dependencies:**
- `axios` - HTTP client
- `getToken` from token.store

---

#### `cli/src/services/token.store.js`
**Purpose:** Local token storage management

**What it contains:**
- `saveToken(token)` - Save JWT to local file
- `getToken()` - Retrieve stored token
- `deleteToken()` - Remove token

**Storage Location:**
- Typically: `~/.envsync/token` or similar
- Platform-specific (Windows/Mac/Linux)

**Functions:**

**`saveToken(token)`**
```
- Creates directory if not exists
- Writes token to file
- Sets appropriate permissions
```

**`getToken()`**
```
- Reads token from file
- Returns null if not found
- Returns token string if exists
```

**`deleteToken()`**
```
- Deletes token file
- Used during logout
```

**Dependencies:**
- `fs` - File system operations
- `path` - Path utilities

---

#### `cli/src/services/security.wrapper.js`
**Purpose:** Security wrapper to prevent secret logging (DETERRENT)

**What it contains:**
- Console method overrides
- Secret value redaction
- Access warnings

**Key Functions:**

**`createSecureEnvProxy(secrets)`**
```
Creates proxy that:
1. Intercepts console.log, console.info, etc.
2. Redacts secret values from output
3. Replaces secret values with [REDACTED]
4. Warns when accessing sensitive env vars
```

**Redaction Logic:**
```javascript
// If output contains secret value
"DATABASE_URL=mongodb://localhost:27017/db"
// Becomes
"DATABASE_URL=[REDACTED]"
```

**⚠️ Important Note:**
- This is a **deterrent**, not foolproof security
- Determined developers can still access process.env
- Main purpose: Prevent accidental logging
- Educate developers about security

**Usage:**
```javascript
const { createSecureEnvProxy } = require('./security.wrapper');
const { envProxy, restore } = createSecureEnvProxy(secrets);
// Use envProxy instead of process.env
// Call restore() when done
```

**Dependencies:**
- None (pure JavaScript)

---

## 📄 Configuration Files

### `server/.env`
**Purpose:** Server environment variables

**Contains:**
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/envsync
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
SECRET_MASTER_KEY=your-32-char-master-key
```

**⚠️ NEVER commit to Git!**

---

### `cli/.env`
**Purpose:** CLI configuration

**Contains:**
```env
ENVSYNC_API_URL=http://localhost:4000/api
```

---

### `server/package.json`
**Purpose:** Server dependencies

**Dependencies:**
- `bcrypt` - Password hashing
- `dotenv` - Environment variables
- `express` - Web framework
- `express-validator` - Input validation
- `jsonwebtoken` - JWT tokens
- `mongoose` - MongoDB ODM

---

### `cli/package.json`
**Purpose:** CLI dependencies and executable configuration

**Dependencies:**
- `axios` - HTTP client
- `chalk` - Terminal colors
- `commander` - CLI framework
- `dotenv` - Environment variables

**Bin Configuration:**
```json
{
  "bin": {
    "envsync": "bin/envsync.js"
  }
}
```

Makes `envsync` command available globally after `npm link`

---

## 🔗 File Dependencies Map

### Server Dependency Chain

```
server.js
  ├── app.js
  │   ├── routes/auth.routes.js
  │   │   └── controllers/auth.controller.js
  │   │       ├── models/envsync_user.model.js
  │   │       ├── config/jwt.js
  │   │       └── utils/audit.js
  │   ├── routes/secret.routes.js
  │   │   ├── middleware/auth.middleware.js
  │   │   ├── middleware/rbac.middleware.js
  │   │   └── controllers/secret.controller.js
  │   │       ├── models/secret.model.js
  │   │       ├── utils/encryption.js
  │   │       └── utils/audit.js
  │   └── routes/runtime.routes.js
  │       ├── middleware/auth.middleware.js
  │       └── controllers/runtime.controller.js
  │           ├── models/secret.model.js
  │           ├── utils/encryption.js
  │           └── utils/audit.js
  └── mongoose (MongoDB connection)
```

### CLI Dependency Chain

```
bin/envsync.js
  ├── commands/login.js
  │   ├── services/api.js
  │   │   └── services/token.store.js
  │   └── services/token.store.js
  ├── commands/whoami.js
  │   └── services/token.store.js
  ├── commands/logout.js
  │   └── services/token.store.js
  └── commands/run.js
      ├── services/api.js
      │   └── services/token.store.js
      └── services/security.wrapper.js (optional)
```

---

## 📊 Data Flow Summary

### Secret Creation Flow
```
Client (Postman/API)
  → POST /api/secrets
  → auth.middleware (verify JWT)
  → rbac.middleware (check admin role)
  → secret.controller.createSecret
  → encryption.encrypt (AES-256-GCM)
  → secret.model (save to MongoDB)
  → audit.logAudit (log action)
  → Response: { secretId }
```

### Runtime Injection Flow
```
CLI: envsync run
  → commands/run.js
  → api.post('/runtime/secrets')
  → Server: runtime.controller.getRuntimeSecrets
  → secret.model.find (get encrypted secrets)
  → encryption.decrypt (decrypt in memory)
  → Response: { KEY: value, ... }
  → CLI: merge into process.env
  → CLI: spawn child process
  → Application runs with secrets
  → Memory cleared (GC)
```

---

## 🎯 Quick File Lookup

**Need to modify:**

| Task | File |
|------|------|
| Add new API endpoint | `routes/*.routes.js` |
| Change business logic | `controllers/*.controller.js` |
| Modify database schema | `models/*.model.js` |
| Update encryption | `utils/encryption.js` |
| Change auth logic | `middleware/auth.middleware.js` |
| Add CLI command | `cli/bin/envsync.js` + `cli/src/commands/*.js` |
| Modify API client | `cli/src/services/api.js` |

---

*Complete file documentation for EnvSync project! 📚*
