# Developer Role Testing - Complete Checklist

## 🎯 Objective
Test that developers have restricted access compared to admins:
- ✅ CAN use runtime secret injection (`envsync run`)
- ❌ CANNOT list secrets
- ❌ CANNOT view secret values
- ❌ CANNOT create secrets

---

## Step 1: Create Developer User

### Run the script:
```bash
cd h:\envSync\server
node scripts\create_developer.js
```

### Expected Output:
```
MongoDB connected
✓ Developer user created successfully!
  Email: developer@example.com
  Role: developer
  Password: dev123456
MongoDB disconnected
```

### Developer Credentials:
- **Email:** `developer@example.com`
- **Password:** `dev123456`
- **Role:** `developer`

---

## Step 2: Login as Developer (Postman)

### Request:
- **Method:** `POST`
- **URL:** `http://localhost:4000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "developer@example.com",
    "password": "dev123456"
  }
  ```

### Expected Response (200 OK):
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "developer@example.com",
    "role": "developer"
  }
}
```

### ⚠️ IMPORTANT: Copy the developer token!

---

## Step 3: Test Developer Restrictions (Postman)

### Test 3.1: Try to List Secrets (Should FAIL ❌)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/secrets?projectId=694c4d14e25030b6bd9ac2fd&environment=dev`
- **Headers:**
  ```
  Authorization: Bearer DEVELOPER_TOKEN_HERE
  ```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Access denied"
}
```

**✅ PASS if:** Developer gets 403 error
**❌ FAIL if:** Developer can see secrets

---

### Test 3.2: Try to Create Secret (Should FAIL ❌)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:4000/api/secrets`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer DEVELOPER_TOKEN_HERE
  ```
- **Body:**
  ```json
  {
    "projectId": "694c4d14e25030b6bd9ac2fd",
    "environment": "dev",
    "key": "TEST_SECRET",
    "value": "test123"
  }
  ```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Access denied"
}
```

**✅ PASS if:** Developer gets 403 error
**❌ FAIL if:** Developer can create secret

---

### Test 3.3: Try to View Secret Value (Should FAIL ❌)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/secrets/ANY_SECRET_ID/value`
- **Headers:**
  ```
  Authorization: Bearer DEVELOPER_TOKEN_HERE
  ```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Access denied"
}
```

**✅ PASS if:** Developer gets 403 error
**❌ FAIL if:** Developer can view secret value

---

## Step 4: Test Developer CAN Use Runtime Injection (CLI)

### Test 4.1: Login as Developer (CLI)

```bash
envsync logout
envsync login
```

**Enter:**
- Email: `developer@example.com`
- Password: `dev123456`

**Expected:**
```
✓ Logged in successfully
```

---

### Test 4.2: Verify Developer Login

```bash
envsync whoami
```

**Expected Output:**
```
Logged in as: developer@example.com (role: developer)
```

---

### Test 4.3: Use Runtime Injection (Should WORK ✅)

```bash
cd "H:\5th Sem\Project React and NodeJS\Autosure version 2.0\AutoSureAI"
envsync run --project 694c4d14e25030b6bd9ac2fd --env dev node server.js
```

**Expected Output:**
```
⚠️  SECURITY NOTICE:
   Secrets are being injected into your application.
   Logging or exposing these secrets is against security policy.
   All secret access is audited and monitored.

✓ Injected 13 secret(s): BREVO_API_KEY, BREVO_SMTP_USER, ...

[Your application starts successfully]
```

**✅ PASS if:** Developer can run application with injected secrets
**❌ FAIL if:** Developer gets access denied error

---

## Step 5: Verify Audit Logs (Admin Only)

### Login as Admin (Postman)

Use admin token from earlier.

### Get Audit Logs

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/audit`
- **Headers:**
  ```
  Authorization: Bearer ADMIN_TOKEN_HERE
  ```

**Expected Response:**
Should show:
- Developer LOGIN action
- Developer RUNTIME_SECRET_ACCESS action
- NO SECRET_CREATE or SECRET_VIEW actions from developer

**Example:**
```json
[
  {
    "userId": "developer_id",
    "role": "developer",
    "action": "LOGIN",
    "timestamp": "2025-12-25T02:30:00.000Z"
  },
  {
    "userId": "developer_id",
    "role": "developer",
    "action": "RUNTIME_SECRET_ACCESS",
    "projectId": "694c4d14e25030b6bd9ac2fd",
    "environment": "dev",
    "timestamp": "2025-12-25T02:31:00.000Z"
  }
]
```

---

## 📊 Testing Results Checklist

### Developer Restrictions (Should FAIL ❌):
- [ ] Cannot list secrets (403 Forbidden)
- [ ] Cannot create secrets (403 Forbidden)
- [ ] Cannot view secret values (403 Forbidden)
- [ ] Cannot access audit logs (403 Forbidden)

### Developer Permissions (Should WORK ✅):
- [ ] Can login successfully
- [ ] Can use `envsync run` command
- [ ] Can access runtime secrets
- [ ] Application runs with injected secrets

### Admin Verification:
- [ ] Admin can view audit logs
- [ ] Audit logs show developer actions
- [ ] No unauthorized actions logged

---

## 🎯 Expected Security Model

| Action | Admin | Developer | Result |
|--------|-------|-----------|--------|
| Login | ✅ | ✅ | Both can login |
| List Secrets | ✅ | ❌ | Only admin |
| View Secret Values | ✅ | ❌ | Only admin |
| Create Secrets | ✅ | ❌ | Only admin |
| Runtime Injection | ✅ | ✅ | Both can use |
| View Audit Logs | ✅ | ❌ | Only admin |

---

## 🐛 Troubleshooting

### Issue: Developer can see secrets
**Problem:** RBAC not working
**Solution:** Check `secret.routes.js` - should have `rbac('admin')` only

### Issue: Developer cannot use runtime injection
**Problem:** Too restrictive
**Solution:** Check `runtime.routes.js` - should allow all authenticated users

### Issue: No audit logs
**Problem:** Audit logging not working
**Solution:** Check `audit-log.model.js` has all required actions

---

## ✅ Success Criteria

**Test is SUCCESSFUL if:**
1. ✅ Developer can login
2. ✅ Developer can use `envsync run`
3. ❌ Developer CANNOT list/view/create secrets
4. ✅ All actions are logged in audit trail
5. ✅ Admin can see developer's audit logs

**Test FAILS if:**
- Developer can view secrets
- Developer can create secrets
- Runtime injection doesn't work for developer
- No audit logs created

---

## 📝 Test Report Template

```
# Developer Role Test Report

Date: 2025-12-25
Tester: [Your Name]

## Results

### Developer Restrictions:
- List Secrets: ❌ BLOCKED (Expected) ✅
- Create Secrets: ❌ BLOCKED (Expected) ✅
- View Secret Values: ❌ BLOCKED (Expected) ✅

### Developer Permissions:
- Login: ✅ SUCCESS ✅
- Runtime Injection: ✅ SUCCESS ✅
- Application Runs: ✅ SUCCESS ✅

### Audit Trail:
- Developer actions logged: ✅ YES ✅
- Correct action types: ✅ YES ✅

## Conclusion
✅ PASS - Security model working as designed
```

---

*Complete Developer Role Testing Guide* 🔒
