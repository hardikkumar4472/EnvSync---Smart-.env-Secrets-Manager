const api = require("../services/api");
const chalk = require("chalk");

module.exports = async () => {
  try {
    const response = await api.get("/projects");
    const { projects, count } = response.data;
    if (count === 0) {
      console.log(chalk.yellow("No projects found."));
      return;
    }
    console.log(chalk.cyan(`\nFound ${count} project(s):\n`));
    console.log(chalk.bold("ID".padEnd(26) + " | NAME"));
    console.log("-".repeat(50));

    projects.forEach((p) => {
      console.log(`${p._id.padEnd(26)} | ${p.name}`);
    });
    console.log("");
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(chalk.red("Error: Not logged in or session expired."));
    } else {
      console.error(
        chalk.red("Error fetching projects:"),
        error.response?.data?.message || error.message
      );
    }
  }
};
