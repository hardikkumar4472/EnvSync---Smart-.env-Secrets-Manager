#!/usr/bin/env node
require("dotenv").config();
const { Command } = require("commander");
const program = new Command();

program
  .name("envsync")
  .description("Runtime-only secret injection CLI")
  .version("1.0.0")
  .enablePositionalOptions();

program.command("login").description("Login to EnvSync").action(
  require("../src/commands/login")
);

program.command("whoami").description("Show current user").action(
  require("../src/commands/whoami")
);

program.command("logout").description("Logout").action(
  require("../src/commands/logout")
);

program
  .command("run")
  .description("Run command with runtime secrets")
  .allowUnknownOption(true)
  .passThroughOptions()
  .requiredOption("--project <id>")
  .requiredOption("--env <environment>")
  .argument("<cmd...>")
  .action(require("../src/commands/run"));


program.parse();
