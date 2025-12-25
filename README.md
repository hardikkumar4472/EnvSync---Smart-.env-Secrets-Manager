# 🔐 EnvSync - Secure Runtime Secret Injection System

> A production-ready secrets management system that injects environment variables at runtime without ever storing them in plain text files.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4+-green.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Security](#security)
- [Use Cases](#use-cases)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**EnvSync** eliminates the security risks of `.env` files by providing runtime-only secret injection. Secrets are encrypted at rest, decrypted only in memory, and never written to disk.

### The Problem

❌ `.env` files in plain text  
❌ Secrets accidentally committed to Git  
❌ Secrets shared via Slack/Email  
❌ No audit trail of secret access  
❌ Manual environment switching  

### The Solution

✅ Encrypted secrets in MongoDB  
✅ Runtime-only decryption (in memory)  
✅ Zero plain text files  
✅ Complete audit trail  
✅ Easy environment switching  
✅ Role-based access control  

---

## ✨ Key Features

### 🔒 Security First
- **AES-256-GCM Encryption** - Military-grade encryption at rest
- **Runtime-Only Decryption** - Secrets exist only in memory
- **Never Touch Disk** - Zero plain text storage
- **Complete Audit Trail** - Every action logged
- **Role-Based Access** - Admin, Developer, Viewer roles

### 🚀 Developer Friendly
- **Simple CLI** - `envsync run --project ID --env prod npm start`
- **No Code Changes** - Works with existing applications
- **Multi-Environment** - Dev, Staging, Prod support
- **Team Collaboration** - Centralized secret management

### 🏢 Enterprise Ready
- **Compliance** - Full audit trail for SOC2, HIPAA, etc.
- **Scalable** - MongoDB backend
- **API-First** - RESTful API for integrations
- **Self-Hosted** - Full control of your data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         EnvSync System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐              ┌──────────────┐            │
│  │     CLI      │◄────JWT─────►│    Server    │            │
│  │  (Client)    │              │   (API)      │            │
│  └──────────────┘              └──────┬───────┘            │
│         │                              │                     │
│         │                              ▼                     │
│         │                      ┌──────────────┐            │
│         │                      │   MongoDB    │            │
│         │                      │  (Encrypted) │            │
│         │                      └──────────────┘            │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │ Application  │  ◄── Secrets injected in memory         │
│  │  (Runtime)   │      Never written to disk              │
│  └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **Server (Backend API)**
   - Express.js REST API
   - MongoDB for encrypted storage
   - JWT authentication
   - Role-based access control

2. **CLI (Client Tool)**
   - Commander.js framework
   - Axios HTTP client
   - Local token storage
   - Runtime secret injection

3. **Database**
   - MongoDB for persistence
   - Encrypted secrets (AES-256-GCM)
   - Audit logs
   - User management

---

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- MongoDB v4+
- npm or yarn

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/envSync.git
cd envSync
```

#### 2. Setup Server

```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=4000
MONGO_URI=mongodb://localhost:27017/envsync
JWT_SECRET=your-jwt-secret-change-this
JWT_EXPIRES_IN=7d
SECRET_MASTER_KEY=your-32-char-master-key-change-this
EOF

# Create admin user
node scripts/create_user.js

# Start server
cd src
node server.js
```

#### 3. Setup CLI

```bash
cd ../cli
npm install
npm link

# Configure CLI
cat > .env << EOF
ENVSYNC_API_URL=http://localhost:4000/api
EOF
```

#### 4. Test Installation

```bash
# Login
envsync login
# Email: hardikm332004@gmail.com
# Password: 123456

# Verify
envsync whoami
```

### First Secret

```bash
# Create project (via API/Postman)
POST http://localhost:4000/api/projects
{
  "name": "MyApp",
  "description": "My Application"
}

# Create secret (via API/Postman)
POST http://localhost:4000/api/secrets
{
  "projectId": "YOUR_PROJECT_ID",
  "environment": "dev",
  "key": "DATABASE_URL",
  "value": "mongodb://localhost:27017/myapp"
}

# Use secret
envsync run --project YOUR_PROJECT_ID --env dev npm start
```

---

## 📚 Documentation

### Complete Guides

| Document | Description |
|----------|-------------|
| [📖 Project Documentation](PROJECT_DOCUMENTATION.md) | Complete system overview and architecture |
| [📁 File Documentation](FILE_DOCUMENTATION.md) | Detailed explanation of every file |
| [🧪 Testing Guide](TESTING_GUIDE.md) | General testing workflow |
| [🧪 MERN Testing Guide](MERN_TESTING_GUIDE.md) | MERN stack specific testing |
| [📮 Postman Testing Guide](POSTMAN_TESTING_GUIDE.md) | API testing with Postman |
| [💻 CLI Testing Guide](CLI_TESTING_GUIDE.md) | Command-line interface testing |
| [🔒 Security Enhancements](SECURITY_ENHANCEMENTS.md) | Security features and updates |

### Quick Links

- [API Reference](POSTMAN_TESTING_GUIDE.md#api-endpoints-testing)
- [CLI Commands](CLI_TESTING_GUIDE.md#command-testing)
- [Security Model](SECURITY_ENHANCEMENTS.md#security-model-summary)
- [Troubleshooting](CLI_TESTING_GUIDE.md#troubleshooting)

---

## 🔐 Security

### Encryption

- **Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Size:** 256 bits
- **IV:** Unique 12-byte random IV per secret
- **Authentication:** Built-in authentication tags

### Access Control

| Role | Create Secrets | View Secrets | Runtime Access | Audit Logs |
|------|---------------|--------------|----------------|------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Developer | ❌ | ❌ | ✅ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ |

### Audit Trail

All actions are logged:
- User authentication
- Secret creation
- Secret viewing (admin only)
- Runtime secret access
- Project management

### Best Practices

1. ✅ Use strong master keys (32+ characters)
2. ✅ Rotate keys regularly
3. ✅ Enable HTTPS in production
4. ✅ Review audit logs weekly
5. ✅ Limit admin access
6. ✅ Use different environments (dev/staging/prod)

---

## 💼 Use Cases

### 1. MERN Stack Applications

```bash
# Server
cd server
envsync run --project ID --env prod npm start

# Client
cd client
envsync run --project ID --env prod npm start
```

### 2. Microservices

```bash
# Service 1
envsync run --project service1 --env prod node service1.js

# Service 2
envsync run --project service2 --env prod node service2.js
```

### 3. CI/CD Pipelines

```yaml
# .github/workflows/deploy.yml
- name: Deploy with EnvSync
  run: |
    envsync login
    envsync run --project $PROJECT_ID --env prod npm run deploy
```

### 4. Team Development

```bash
# Developer 1 (local dev)
envsync run --project myapp --env dev npm start

# Developer 2 (staging)
envsync run --project myapp --env staging npm start

# Production
envsync run --project myapp --env prod npm start
```

---

## 🎯 CLI Commands

### Authentication

```bash
# Login
envsync login

# Check current user
envsync whoami

# Logout
envsync logout
```

### Runtime Injection

```bash
# Basic usage
envsync run --project <PROJECT_ID> --env <ENVIRONMENT> <COMMAND>

# Examples
envsync run --project 507f... --env dev npm start
envsync run --project 507f... --env prod node server.js
envsync run --project 507f... --env staging npm run build
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects

### Secrets (Admin Only)
- `POST /api/secrets` - Create secret
- `GET /api/secrets` - List secrets
- `GET /api/secrets/:id/value` - View secret value

### Runtime (All Users)
- `POST /api/runtime/secrets` - Get runtime secrets

### Audit (Admin Only)
- `GET /api/audit` - Query audit logs

---

## 📊 Project Structure

```
envSync/
├── server/                 # Backend API
│   ├── src/
│   │   ├── server.js      # Entry point
│   │   ├── app.js         # Express config
│   │   ├── config/        # JWT, etc.
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, RBAC
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API routes
│   │   └── utils/         # Encryption, audit
│   ├── scripts/           # Utility scripts
│   └── package.json
│
├── cli/                   # Command-line tool
│   ├── bin/
│   │   └── envsync.js    # CLI entry
│   ├── src/
│   │   ├── commands/     # CLI commands
│   │   └── services/     # API client
│   └── package.json
│
└── docs/                  # Documentation
    ├── PROJECT_DOCUMENTATION.md
    ├── FILE_DOCUMENTATION.md
    ├── TESTING_GUIDE.md
    ├── MERN_TESTING_GUIDE.md
    ├── POSTMAN_TESTING_GUIDE.md
    ├── CLI_TESTING_GUIDE.md
    └── SECURITY_ENHANCEMENTS.md
```

---

## 🧪 Testing

### Run Tests

```bash
# Server tests
cd server
npm test

# CLI tests
cd cli
npm test
```

### Manual Testing

See comprehensive testing guides:
- [Postman Testing](POSTMAN_TESTING_GUIDE.md)
- [CLI Testing](CLI_TESTING_GUIDE.md)
- [MERN Testing](MERN_TESTING_GUIDE.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** `envsync: command not found`  
**Solution:** Run `npm link` in the CLI directory

**Issue:** Login fails  
**Solution:** Check server is running and credentials are correct

**Issue:** Secrets not injected  
**Solution:** Verify project ID and environment are correct

See [CLI Testing Guide](CLI_TESTING_GUIDE.md#troubleshooting) for more.

---

## 📝 Changelog

### Version 1.0.0 (2025-12-25)

**Features:**
- ✅ AES-256-GCM encryption
- ✅ Runtime-only secret injection
- ✅ Role-based access control
- ✅ Complete audit trail
- ✅ Multi-environment support
- ✅ CLI tool
- ✅ RESTful API

**Security Enhancements:**
- ✅ Admin-only secret viewing
- ✅ Enhanced audit logging
- ✅ Security warnings in CLI
- ✅ Console logging protection (deterrent)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Hardik** - *Initial work* - [hardikm332004@gmail.com](mailto:hardikm332004@gmail.com)

---

## 🙏 Acknowledgments

- Inspired by HashiCorp Vault and AWS Secrets Manager
- Built with Express.js, MongoDB, and Commander.js
- Security best practices from OWASP

---

## 📞 Support

- **Documentation:** See [docs](/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/envSync/issues)
- **Email:** hardikm332004@gmail.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 🔗 Related Projects

- [HashiCorp Vault](https://www.vaultproject.io/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Doppler](https://www.doppler.com/)
- [Infisical](https://infisical.com/)

---

<div align="center">

**Made with ❤️ for secure secret management**

[⬆ Back to Top](#-envsync---secure-runtime-secret-injection-system)

</div>
