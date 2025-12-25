# EnvSync Admin Dashboard

A stunning, security-themed admin dashboard for managing the EnvSync secret management system.

## 🎨 Features

- **Hacking/Security Theme** - Dark mode with cyber aesthetics, glowing effects, and matrix-style animations
- **Complete CLI Documentation** - All 6 CLI commands with detailed examples and usage
- **Project Management** - Create and manage application projects
- **Secret Management** - Admin-only access to view and manage encrypted secrets
- **Audit Logs** - Complete activity trail for compliance
- **Documentation** - Comprehensive guides for admins and developers
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- EnvSync server running on `http://localhost:4000`

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Default Login Credentials

```
Email: hardikm332004@gmail.com
Password: 123456
```

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   ├── Projects.jsx        # Project management
│   │   ├── Secrets.jsx         # Secret management (admin only)
│   │   ├── AuditLogs.jsx       # Audit trail (admin only)
│   │   ├── CLICommands.jsx     # Complete CLI documentation
│   │   └── Documentation.jsx   # Admin & developer guides
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles with cyber theme
├── .env                        # Environment configuration
├── package.json
└── vite.config.js
```

## 🎯 Pages Overview

### 1. Dashboard
- System statistics (projects, secrets, audit logs)
- Recent activity feed
- Quick start commands
- Security features overview

### 2. Projects
- List all projects
- Create new projects
- View project details and IDs
- Search functionality

### 3. Secrets (Admin Only)
- Filter by project and environment
- View encrypted secrets
- Create new secrets
- View decrypted values (logged in audit)

### 4. Audit Logs (Admin Only)
- Complete activity trail
- Filter by action type
- Search by user, IP, or action
- Pagination support

### 5. CLI Commands
- All 6 CLI commands documented
- Detailed syntax and examples
- Interactive copy-to-clipboard
- Common workflows
- Security features explained

### 6. Documentation
- **Overview** - What is EnvSync, key features
- **Admin Guide** - Setup, responsibilities, best practices
- **Developer Guide** - Quick start, usage patterns, access control
- **Architecture** - System components, security layers

## 🔐 Access Control

### Admin Role
- ✅ View dashboard
- ✅ Manage projects
- ✅ Manage secrets
- ✅ View audit logs
- ✅ View CLI commands
- ✅ View documentation

### Developer Role
- ✅ View dashboard
- ✅ View projects
- ❌ Manage secrets
- ❌ View audit logs
- ✅ View CLI commands
- ✅ View documentation

### Viewer Role
- ✅ View dashboard
- ✅ View projects
- ❌ Manage secrets
- ❌ View audit logs
- ✅ View CLI commands
- ✅ View documentation

## 🎨 Theme Customization

The dashboard uses CSS variables for easy theme customization. Edit `src/index.css`:

```css
:root {
  --cyber-green: #00ff41;
  --cyber-blue: #00d9ff;
  --cyber-purple: #b026ff;
  --cyber-red: #ff0055;
  --dark-bg: #0a0e27;
  --darker-bg: #050814;
  --card-bg: #0f1629;
  --border-color: #1a2332;
  --text-primary: #e0e7ff;
  --text-secondary: #94a3b8;
}
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:4000/api
```

## 📚 CLI Commands Reference

The dashboard includes comprehensive documentation for all CLI commands:

1. **envsync --version** - Check CLI version
2. **envsync --help** - Display help
3. **envsync login** - Authenticate with server
4. **envsync whoami** - Show current user
5. **envsync logout** - Clear authentication
6. **envsync run** - Run command with runtime secrets

Each command includes:
- Detailed syntax
- Multiple examples
- Expected output
- Security features
- Use cases
- Common workflows

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - Admin, Developer, Viewer roles
- **Protected Routes** - Automatic redirect for unauthorized access
- **Audit Trail** - All actions logged
- **Encrypted Secrets** - AES-256-GCM encryption
- **HTTPS Ready** - Production-ready security

## 🎯 Usage Guide

### For Administrators

1. **Login** with admin credentials
2. **Create Projects** for your applications
3. **Add Secrets** for each environment (dev, staging, prod)
4. **Monitor Audit Logs** for security compliance
5. **Share Project IDs** with developers
6. **Review Documentation** for best practices

### For Developers

1. **Login** with developer credentials
2. **View Projects** to get project IDs
3. **Read CLI Commands** documentation
4. **Use CLI** to run applications with secrets
5. **Follow Best Practices** from documentation

## 📖 Additional Resources

- [Main README](../README.md) - Project overview
- [CLI Command Reference](../CLI_COMMAND_REFERENCE.md) - Detailed CLI docs
- [Security Enhancements](../SECURITY_ENHANCEMENTS.md) - Security features
- [Testing Guide](../TESTING_GUIDE.md) - How to test the system

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and component structure.

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details

---

**Made with ❤️ for secure secret management**
