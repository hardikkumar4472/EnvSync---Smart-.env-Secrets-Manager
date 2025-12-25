const fs = require("fs");
const path = require("path");
const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE, ".envsync");
if (!fs.existsSync(TOKEN_PATH)) fs.mkdirSync(TOKEN_PATH);

const TOKEN_FILE = path.join(TOKEN_PATH, "token.json");

exports.saveToken = (token) => {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }), { mode: 0o600 });
};

exports.getToken = () => {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_FILE)).token;
};

exports.clearToken = () => {
  if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
};
