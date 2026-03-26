const api = require("../services/api");
const { saveToken } = require("../services/token.store");
const chalk = require("chalk");

module.exports = async () => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q) => new Promise((res) => readline.question(q, res));

  const email = (await ask("Email: ")).trim();
  const password = (await ask("Password: ")).trim();
  readline.close();

  try {
    const res = await api.post("/auth/login", { email, password });
    try {
      saveToken(res.data.token);
      console.log(chalk.green("Logged in successfully"));
    } catch (tokenError) {
      console.log(chalk.yellow("Login successful, but failed to save session token locally."));
      console.log(chalk.red(`Folder Permission Error: ${tokenError.message}`));
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.log(chalk.red(`Login failed: ${message}`));
  }
};
