# Deployment Guide for EnvSync

To make the EnvSync CLI work on anyone's PC, you need to follow these two main steps:

1. **Deploy the Backend Server** (So it's accessible over the internet)
2. **Configure and Publish the CLI** (So it points to your deployed server)

---

## Part 1: Deploying the Backend (Server)

The CLI needs a central server to store and retrieve secrets. You can deploy this easily on free platforms like **Render**, **Railway**, or **Heroku**.

### Option A: Deploy on Render (Recommended)

1. Push your code to GitHub.
2. Sign up at [render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your repository.
5. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `MONGO_URI`: Your MongoDB connection string (MongoDB Atlas is recommended).
     - `JWT_SECRET`: A long random string.
     - `SESSION_SECRET`: A long random string.
     - `NODE_ENV`: `production`

6. Click **Deploy**. Render will give you a URL like `https://envsync-backend.onrender.com`.

---

## Part 2: configuring the CLI

Now that you have a live server URL, you need to tell the CLI to use it.

1. Open `cli/src/services/api.js`.
2. Update the default URL to your deployed server URL.

**Current:**
```javascript
const api = axios.create({
  baseURL: process.env.ENVSYNC_API_URL || "http://localhost:4000/api",
});
```

**Change to:**
```javascript
const api = axios.create({
  // Replace with your actual Render/Heroku URL
  baseURL: process.env.ENVSYNC_API_URL || "https://your-app-name.onrender.com/api", 
});
```

---

## Part 3: Publishing the CLI

To let anyone install it via `npm install -g envsync-cli`, you need to publish it to the npm registry.

### 1. Prepare `package.json`
Open `cli/package.json` and ensure it has unique details:
```json
{
  "name": "envsync-cli-tool",  // Must be unique on npm
  "version": "1.0.0",
  "bin": {
    "envsync": "bin/envsync.js"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. Login to npm
Run this in your terminal:
```bash
npm login
```

### 3. Publish
Navigate to the `cli` folder and publish:
```bash
cd cli
npm publish
```

---

## Part 4: How Users Install It

Once published, anyone can install your CLI using:

```bash
npm install -g envsync-cli-tool
```

They can then run:
```bash
envsync login
envsync run ...
```

### Alternative: Install from Git (Without npm publish)
If you don't want to publish to npm, users can install directly from your GitHub repo:

```bash
npm install -g git+https://github.com/yourusername/envsync.git#main
```
*(Note: You'll need to adjust the repo structure or point to the specific cli folder if using monorepo)*
