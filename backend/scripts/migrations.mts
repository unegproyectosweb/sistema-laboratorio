#!/usr/bin/env node
import { ExitPromptError } from "@inquirer/core";
import * as prompts from "@inquirer/prompts";
import { Command } from "commander";
import { execa, ExecaError } from "execa";
import path from "path";
import * as tsdown from "tsdown";

const program = new Command();
// @ts-expect-error - omit
const BACKEND_PATH = path.resolve(import.meta.dirname, "..");
const DATASOURCE_PATH = path.join(BACKEND_PATH, "dist/config/typeorm.cjs");

const $ = execa({ stdio: "inherit" });

async function runTypeorm(args: string[]) {
  await tsdown.build({
    report: false,
    logLevel: "error",
  });
  await $("typeorm", ["-d", DATASOURCE_PATH, ...args]);
}

async function _buildProject() {
  await $("pnpm", ["--filter", "backend", "run", "build"]);
}

program
  .name("migrations")
  .description("Herramientas para generar y ejecutar migraciones de TypeORM")
  .version("0.1.0");

program
  .command("generate")
  .description("Genera una nueva migración (solicita un nombre)")
  .option("-n, --name <name>", "Migration name")
  .action(async (options) => {
    const name =
      options.name ||
      (await prompts.input({
        message: "Ingrese en nombre de la migración:",
        required: true,
        default: "migration",
      }));

    const dest = `src/migrations/${String(name).replace(/\s+/g, "_")}`;

    // Build args for typeorm migration:generate
    // Assumes TypeORM config is set in backend/ormconfig or package scripts
    await runTypeorm(["migration:generate", "--pretty", dest]);
  });

program
  .command("run")
  .description("Ejecuta migraciones pendientes")
  .action(async () => {
    await runTypeorm(["migration:run"]);
  });

program
  .command("show")
  .description("Lista las migraciones")
  .action(async () => {
    await runTypeorm(["migration:show"]);
  });

program
  .command("revert")
  .description("Revierte la última migración (pide confirmación)")
  .option("-y, --yes", "Skip confirmation")
  .action(async (options) => {
    if (!options.yes) {
      const confirm = await prompts.confirm({
        message: "¿Desea revertir la última migración?",
      });
      if (!confirm) {
        console.log("Abortado.");
        process.exit(0);
      }
    }

    await runTypeorm(["migration:revert"]);
  });

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof ExitPromptError) {
    // User exited prompt
  } else if (err instanceof ExecaError) {
    console.error(err.shortMessage);
  } else {
    console.error(err);
  }

  process.exit(1);
});
