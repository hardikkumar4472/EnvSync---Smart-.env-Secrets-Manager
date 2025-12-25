const api = require("../services/api");
const { saveToken } = require("../services/token.store");
const chalk = require("chalk");

module.exports = async () => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q) => new Promise((res) => readline.question(q, res));

  const email = await ask("Email: ");
  const password = await ask("Password: ");
  readline.close();

  try {
    const res = await api.post("/auth/login", { email, password });
    saveToken(res.data.token);
    console.log(chalk.green("Logged in successfully"));
  } catch {
    console.log(chalk.red("Login failed"));
  }
};
