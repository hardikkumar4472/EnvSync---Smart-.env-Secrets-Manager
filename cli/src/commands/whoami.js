const api = require("../services/api");
const chalk = require("chalk");

module.exports = async () => {
  try {
    const res = await api.get("/protected/me");
    console.log(chalk.green(`Currently logged in as: ${res.data.user.email} (${res.data.user.role})`));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.log(chalk.red(`Failed to fetch user info: ${message}`));
    console.log(chalk.yellow("Tip: Check if your ENVSYNC_API_URL is set correctly."));
  }
};
