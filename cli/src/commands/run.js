const { spawn } = require("child_process");
const api = require("../services/api");
const chalk = require("chalk");
const path = require("path");

module.exports = async (cmd, options) => {
  try {
    const res = await api.post("/runtime/secrets", {
      projectId: options.project,
      environment: options.env,
    });

    // Security warning
    console.log(chalk.yellow("\n⚠️  SECURITY NOTICE:"));
    console.log(chalk.yellow("   Secrets are being injected into your application."));
    console.log(chalk.yellow("   Logging or exposing these secrets is against security policy."));
    console.log(chalk.yellow("   All secret access is audited and monitored.\n"));

    // Prepare environment with secrets
    const secretKeys = Object.keys(res.data);
    const secretValues = Object.values(res.data);
    
    // Add secret keys and values to env for protection loader
    const env = { 
      ...process.env, 
      ...res.data,
      ENVSYNC_SECRET_KEYS: JSON.stringify(secretKeys),
      ENVSYNC_SECRET_VALUES: JSON.stringify(secretValues)
    };

    // Inform user about injected secrets (keys only, not values)
    console.log(chalk.green(`✓ Injected ${secretKeys.length} secret(s): ${secretKeys.join(", ")}\n`));

    // Prepare spawn options
    const spawnOptions = {
      stdio: "inherit",
      env,
      shell: process.platform === 'win32',
    };

    // Add console protection for Node.js applications
    let modifiedCmd = [...cmd];
    if (cmd[0] === 'node' || cmd[0].includes('node')) {
      const protectionPath = path.join(__dirname, '..', 'services', 'console-protection-loader.js');
      // Insert --require flag before the script
      modifiedCmd.splice(1, 0, '--require', protectionPath);
      console.log(chalk.yellow("🔒 Console logging protection enabled\n"));
    } else {
      console.log(chalk.yellow("⚠️  Console protection only works with Node.js applications\n"));
    }

    const child = spawn(modifiedCmd[0], modifiedCmd.slice(1), spawnOptions);

    child.on("exit", (code) => {
      process.exit(code);
    });

    child.on("error", (error) => {
      console.error(chalk.red("Error spawning process:"), error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error(chalk.red("Error fetching secrets:"), error.message);
    if (error.response?.status === 403) {
      console.error(chalk.red("Access denied. Only authorized users can access runtime secrets."));
    }
    process.exit(1);
  }
};
