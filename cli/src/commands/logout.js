const { clearToken } = require("../services/token.store");

module.exports = () => {
  clearToken();
  console.log("Logged out");
};