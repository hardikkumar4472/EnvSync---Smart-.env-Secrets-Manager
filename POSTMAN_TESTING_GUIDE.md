# EnvSync - Complete Postman Testing Guide

## 📋 Table of Contents
1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [API Endpoints Testing](#api-endpoints-testing)
4. [Test Scenarios](#test-scenarios)
5. [Expected Responses](#expected-responses)

---

## 🚀 Setup

### Prerequisites
- Postman installed (Desktop or Web)
- EnvSync server running on `http://localhost:4000`
- MongoDB running
- Admin user created

### Create Postman Collection

1. Open Postman
2. Click **"New Collection"**
3. Name it: **"EnvSync API"**
4. Add description: **"Complete API testing for EnvSync secrets management system"**

---

## 🔧 Environment Variables

### Create Postman Environment

1. Click **Environments** (left sidebar)
2. Click **"Create Environment"**
3. Name: **"EnvSync Local"**

### Add Variables:

| Variable Name | Initial Value | Current Value |
|--------------|---------------|---------------|
| `base_url` | `http://localhost:4000/api` | `http://localhost:4000/api` |
| `token` | (leave empty) | (will be set automatically) |
| `project_id` | (leave empty) | (will be set automatically) |
| `secret_id` | (leave empty) | (will be set automatically) |

4. Click **Save**
5. Select this environment from the dropdown (top right)

---

## 📡 API Endpoints Testing

### 1. Authentication

#### 1.1 Login (Admin)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "hardikm332004@gmail.com",
    "password": "123456"
  }
  ```

**Tests Script (add in "Tests" tab):**
```javascript
// Parse response
const response = pm.response.json();

// Set token as environment variable
if (response.token) {
    pm.environment.set("token", response.token);
    console.log("✓ Token saved:", response.token);
}

// Tests
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    pm.expect(response).to.have.property("token");
});

pm.test("Response has user object", function () {
    pm.expect(response).to.have.property("user");
    pm.expect(response.user).to.have.property("email");
    pm.expect(response.user).to.have.property("role");
});

pm.test("User role is admin", function () {
    pm.expect(response.user.role).to.equal("admin");
});
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67890abcdef12345",
    "email": "hardikm332004@gmail.com",
    "role": "admin"
  }
}
```

---

#### 1.2 Login (Invalid Credentials)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Body:**
  ```json
  {
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }
  ```

**Tests:**
```javascript
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});

pm.test("Error message present", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property("message");
});
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. Projects

#### 2.1 Create Project (Admin Only)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/projects`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body:**
  ```json
  {
    "name": "MyTestProject",
    "description": "Testing EnvSync with Postman"
  }
  ```

**Tests:**
```javascript
const response = pm.response.json();

// Save project ID
if (response.id || response._id) {
    const projectId = response.id || response._id;
    pm.environment.set("project_id", projectId);
    console.log("✓ Project ID saved:", projectId);
}

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Project created successfully", function () {
    pm.expect(response).to.have.property("name");
    pm.expect(response.name).to.equal("MyTestProject");
});
```

**Expected Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "MyTestProject",
  "description": "Testing EnvSync with Postman",
  "isActive": true,
  "createdAt": "2025-12-25T01:00:00.000Z",
  "updatedAt": "2025-12-25T01:00:00.000Z"
}
```

---

#### 2.2 List All Projects

**Request:**
- **Method:** `GET`
- **URL:** `{{base_url}}/projects`
- **Headers:**
  ```
  Authorization: Bearer {{token}}
  ```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    pm.expect(response).to.be.an("array");
});

pm.test("Projects have required fields", function () {
    if (response.length > 0) {
        pm.expect(response[0]).to.have.property("name");
        pm.expect(response[0]).to.have.property("isActive");
    }
});
```

---

### 3. Secrets Management

#### 3.1 Create Secret (Admin Only)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/secrets`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body:**
  ```json
  {
    "projectId": "{{project_id}}",
    "environment": "dev",
    "key": "DATABASE_URL",
    "value": "mongodb://localhost:27017/testdb"
  }
  ```

**Tests:**
```javascript
const response = pm.response.json();

// Save secret ID
if (response.secretId) {
    pm.environment.set("secret_id", response.secretId);
    console.log("✓ Secret ID saved:", response.secretId);
}

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Secret created successfully", function () {
    pm.expect(response).to.have.property("message");
    pm.expect(response.message).to.include("stored securely");
});

pm.test("Secret ID returned", function () {
    pm.expect(response).to.have.property("secretId");
});
```

**Expected Response (201 Created):**
```json
{
  "message": "Secret stored securely",
  "secretId": "67890xyz123456"
}
```

---

#### 3.2 Create Multiple Secrets (Batch Test)

Create these secrets one by one:

**Secret 2 - API Key:**
```json
{
  "projectId": "{{project_id}}",
  "environment": "dev",
  "key": "API_KEY",
  "value": "sk-test-1234567890abcdef"
}
```

**Secret 3 - JWT Secret:**
```json
{
  "projectId": "{{project_id}}",
  "environment": "dev",
  "key": "JWT_SECRET",
  "value": "my-super-secret-jwt-key"
}
```

**Secret 4 - Port:**
```json
{
  "projectId": "{{project_id}}",
  "environment": "dev",
  "key": "PORT",
  "value": "5000"
}
```

**Secret 5 - Production Database:**
```json
{
  "projectId": "{{project_id}}",
  "environment": "prod",
  "key": "DATABASE_URL",
  "value": "mongodb://prod-server:27017/proddb"
}
```

---

#### 3.3 List Secrets (Admin Only)

**Request:**
- **Method:** `GET`
- **URL:** `{{base_url}}/secrets?projectId={{project_id}}&environment=dev`
- **Headers:**
  ```
  Authorization: Bearer {{token}}
  ```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has secrets array", function () {
    pm.expect(response).to.have.property("secrets");
    pm.expect(response.secrets).to.be.an("array");
});

pm.test("Response has count", function () {
    pm.expect(response).to.have.property("count");
    pm.expect(response.count).to.be.a("number");
});

pm.test("Secrets do not contain encrypted values", function () {
    if (response.secrets.length > 0) {
        pm.expect(response.secrets[0]).to.have.property("key");
        pm.expect(response.secrets[0]).to.not.have.property("encryptedValue");
    }
});

pm.test("Count matches array length", function () {
    pm.expect(response.count).to.equal(response.secrets.length);
});
```

**Expected Response (200 OK):**
```json
{
  "count": 4,
  "secrets": [
    {
      "_id": "67890xyz123456",
      "key": "DATABASE_URL",
      "environment": "dev",
      "projectId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-12-25T01:00:00.000Z",
      "updatedAt": "2025-12-25T01:00:00.000Z"
    },
    {
      "_id": "67890xyz123457",
      "key": "API_KEY",
      "environment": "dev",
      "projectId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-12-25T01:01:00.000Z",
      "updatedAt": "2025-12-25T01:01:00.000Z"
    }
  ]
}
```

**Note:** Values are NOT returned - only metadata!

---

#### 3.4 Get Secret Value (Admin Only - NEW)

**Request:**
- **Method:** `GET`
- **URL:** `{{base_url}}/secrets/{{secret_id}}/value`
- **Headers:**
  ```
  Authorization: Bearer {{token}}
  ```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has decrypted value", function () {
    pm.expect(response).to.have.property("value");
    pm.expect(response.value).to.be.a("string");
});

pm.test("Response has key", function () {
    pm.expect(response).to.have.property("key");
});

pm.test("Value is decrypted (not encrypted object)", function () {
    pm.expect(response.value).to.not.have.property("iv");
    pm.expect(response.value).to.not.have.property("content");
});
```

**Expected Response (200 OK):**
```json
{
  "key": "DATABASE_URL",
  "value": "mongodb://localhost:27017/testdb",
  "environment": "dev",
  "projectId": "507f1f77bcf86cd799439011",
  "createdAt": "2025-12-25T01:00:00.000Z",
  "updatedAt": "2025-12-25T01:00:00.000Z"
}
```

---

### 4. Runtime Secret Injection

#### 4.1 Get Runtime Secrets (Developer Access)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/runtime/secrets`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body:**
  ```json
  {
    "projectId": "{{project_id}}",
    "environment": "dev"
  }
  ```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an object with secrets", function () {
    pm.expect(response).to.be.an("object");
});

pm.test("Secrets are decrypted (plain key-value pairs)", function () {
    pm.expect(response).to.have.property("DATABASE_URL");
    pm.expect(response.DATABASE_URL).to.be.a("string");
    pm.expect(response.DATABASE_URL).to.not.have.property("iv");
});

pm.test("All expected secrets present", function () {
    pm.expect(response).to.have.property("DATABASE_URL");
    pm.expect(response).to.have.property("API_KEY");
    pm.expect(response).to.have.property("JWT_SECRET");
    pm.expect(response).to.have.property("PORT");
});
```

**Expected Response (200 OK):**
```json
{
  "DATABASE_URL": "mongodb://localhost:27017/testdb",
  "API_KEY": "sk-test-1234567890abcdef",
  "JWT_SECRET": "my-super-secret-jwt-key",
  "PORT": "5000"
}
```

**⚠️ Security Note:** This endpoint returns decrypted secrets for runtime injection. In production, this should be heavily monitored and audited.

---

#### 4.2 Get Runtime Secrets (Production Environment)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/runtime/secrets`
- **Body:**
  ```json
  {
    "projectId": "{{project_id}}",
    "environment": "prod"
  }
  ```

**Expected Response:**
```json
{
  "DATABASE_URL": "mongodb://prod-server:27017/proddb"
}
```

---

### 5. Audit Logs

#### 5.1 Get Audit Logs (Admin Only)

**Request:**
- **Method:** `GET`
- **URL:** `{{base_url}}/audit`
- **Headers:**
  ```
  Authorization: Bearer {{token}}
  ```

**Tests:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    pm.expect(response).to.be.an("array");
});

pm.test("Audit logs have required fields", function () {
    if (response.length > 0) {
        pm.expect(response[0]).to.have.property("action");
        pm.expect(response[0]).to.have.property("user");
        pm.expect(response[0]).to.have.property("timestamp");
    }
});

pm.test("Contains expected actions", function () {
    const actions = response.map(log => log.action);
    pm.expect(actions).to.include.members(["LOGIN", "SECRET_CREATE", "RUNTIME_SECRET_ACCESS"]);
});
```

**Expected Response (200 OK):**
```json
[
  {
    "_id": "audit123",
    "user": {
      "id": "67890abcdef12345",
      "role": "admin"
    },
    "action": "LOGIN",
    "ipAddress": "::1",
    "timestamp": "2025-12-25T01:00:00.000Z"
  },
  {
    "_id": "audit124",
    "user": {
      "id": "67890abcdef12345",
      "role": "admin"
    },
    "action": "SECRET_CREATE",
    "projectId": "507f1f77bcf86cd799439011",
    "environment": "dev",
    "ipAddress": "::1",
    "timestamp": "2025-12-25T01:05:00.000Z"
  },
  {
    "_id": "audit125",
    "user": {
      "id": "67890abcdef12345",
      "role": "admin"
    },
    "action": "RUNTIME_SECRET_ACCESS",
    "projectId": "507f1f77bcf86cd799439011",
    "environment": "dev",
    "ipAddress": "::1",
    "timestamp": "2025-12-25T01:10:00.000Z"
  }
]
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Admin Workflow

**Order of execution:**

1. ✅ Login as Admin
2. ✅ Create Project
3. ✅ Create Secret (dev environment)
4. ✅ Create Secret (prod environment)
5. ✅ List Secrets
6. ✅ Get Secret Value
7. ✅ Get Runtime Secrets
8. ✅ View Audit Logs

---

### Scenario 2: Developer Role Testing (Create Developer User First)

**Step 1: Create Developer User (via script or admin panel)**

**Step 2: Login as Developer**
```json
{
  "email": "developer@example.com",
  "password": "devpass123"
}
```

**Step 3: Try to Create Secret (Should Fail - 403)**
- Expected: Access Denied

**Step 4: Try to List Secrets (Should Fail - 403)**
- Expected: Access Denied

**Step 5: Get Runtime Secrets (Should Succeed)**
- Expected: Returns decrypted secrets

---

### Scenario 3: Unauthorized Access Testing

**Test 1: No Token**
- Remove Authorization header
- Try any protected endpoint
- Expected: 401 Unauthorized

**Test 2: Invalid Token**
- Set Authorization: `Bearer invalid_token_here`
- Expected: 401 Invalid token

**Test 3: Expired Token**
- Use an old/expired token
- Expected: 401 Token expired

---

### Scenario 4: Input Validation Testing

**Test 1: Missing Required Fields**
```json
{
  "projectId": "{{project_id}}",
  "environment": "dev"
  // Missing "key" and "value"
}
```
Expected: 400 Bad Request

**Test 2: Invalid Environment**
```json
{
  "projectId": "{{project_id}}",
  "environment": "invalid_env",
  "key": "TEST",
  "value": "test"
}
```
Expected: 400 or validation error

**Test 3: Duplicate Secret**
- Create same secret twice
- Expected: Error (unique constraint violation)

---

## 📊 Collection Runner

### Setup Collection Runner Test

1. Click on collection **"EnvSync API"**
2. Click **"Run"**
3. Select all requests
4. Set iterations: **1**
5. Set delay: **500ms**
6. Click **"Run EnvSync API"**

### Expected Results:
- All tests should pass
- Environment variables should be set automatically
- Final audit log should show all actions

---

## 🔒 Security Testing Checklist

- [ ] Admin can create secrets
- [ ] Admin can view secret values
- [ ] Admin can list secrets
- [ ] Developer CANNOT create secrets
- [ ] Developer CANNOT view secret list
- [ ] Developer CAN get runtime secrets
- [ ] Unauthorized users get 401
- [ ] Invalid tokens are rejected
- [ ] All actions are audited
- [ ] Secrets are encrypted in database
- [ ] Values are not exposed in list endpoint

---

## 📝 Export Collection

### To share with team:

1. Click on collection **"EnvSync API"**
2. Click **"..."** (three dots)
3. Click **"Export"**
4. Choose **Collection v2.1**
5. Save as: `EnvSync_API_Collection.json`

### Import Collection:

1. Click **"Import"**
2. Select the JSON file
3. Click **"Import"**

---

## 🎯 Quick Reference

### Base URL
```
http://localhost:4000/api
```

### Authentication Header
```
Authorization: Bearer {{token}}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Access Denied)
- `404` - Not Found
- `500` - Server Error

---

## 💡 Pro Tips

1. **Use Environment Variables** - Store token, project_id, etc.
2. **Use Tests Tab** - Automate variable extraction
3. **Use Collection Runner** - Test entire workflow
4. **Save Examples** - Save successful responses as examples
5. **Use Pre-request Scripts** - For dynamic data generation
6. **Monitor Network** - Check actual request/response in console

---

*Happy Testing! 🚀*
