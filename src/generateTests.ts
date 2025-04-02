import chalk from "chalk";
import { CommandData } from "./command";
import { findPackages, GoPackage } from "./packages";
import { settings } from "./settings";
import { aiGenerateObject, ModelClass } from "./ai";
import { z } from "zod";
import * as fs from "fs";
import { generateTestsPrompt } from "./prompts";

function formatContent(paths: string[]): string {
  let formattedContent = "";
  paths.forEach((path) => {
    const data = fs.readFileSync(path);
    if (data.length === 0) {
      console.log(chalk.yellow(`Warning: No data found for file ${path}`));
      return;
    }

    const content = `*****\n${path}\n*****\n\n${data.toString(
      "utf-8"
    )}\n\n*****`;
    formattedContent += content;
  });

  return formattedContent;
}

// Separate packages which already contains _test.go files from the one which does not
function filterPackages(goPackages: GoPackage[]) {
  const packagesWithTests: GoPackage[] = [];
  const packagesWithoutTests: GoPackage[] = [];
  goPackages.forEach((goPackage) => {
    const { files } = goPackage;
    const testFiles = [];
    files.forEach((file) => {
      if (file.endsWith("_test.go")) {
        testFiles.push(file);
      }
    });

    if (testFiles.length > 0) {
      packagesWithTests.push(goPackage);
    } else {
      packagesWithoutTests.push(goPackage);
    }
  });

  return { packagesWithTests, packagesWithoutTests };
}

const generate = async (path: string, options: any) => {
  let excludedPaths: string[] = [];
  if ("exclude" in options) {
    excludedPaths = options.exclude.split(/\s*,\s*/);
  }
  const { packagesDirPaths, goPackages } = await findPackages(path);

  const { packagesWithoutTests, packagesWithTests } =
    filterPackages(goPackages);

  if (packagesWithTests.length > 0) {
    console.log(
      chalk.green(`Found ${packagesWithTests.length} packages with test files.`)
    );
  }

  if (packagesWithoutTests.length > 0) {
    console.log(
      chalk.green(
        `Found ${packagesWithoutTests.length} packages without test files.`
      )
    );
  }

  if (!settings.skipPackageIfTestsExists) {
    console.log(chalk.red(`Error: Not implemented.`));
    process.exit(1);
  }

  packagesWithoutTests.forEach(async (goPackage) => {
    const formattedFilesContent = formatContent(goPackage.files);
    const prompt = generateTestsPrompt({
      sourceFiles: formattedFilesContent,
    });

    if (settings.LOG_LEVEL === "DEBUG") {
      console.log(chalk.magenta(`PROMPT:\n${prompt}`));
    } 

    const result = await aiGenerateObject({
      modelProvider:
        "provider" in options
          ? options.provider.toUpperCase()
          : settings.provider,
      prompt,
      schema: z.object({
        code: z.string(),
        fileName: z.string(),
      }),
      modelClass: ModelClass.MEDIUM
    });

    fs.writeFileSync(result.fileName, result.code, "utf-8")
    console.log(chalk.blue(`Created ${result.fileName}`))
  });

  return;
};

const generateCommand: CommandData = {
  name: "generate",
  definition: "generate <path>",
  description: "Generate tests for a give project.",
  action: generate,
  options: [
    ["--exclude <PATHS>", "Specify paths to exclude from parsing."],
    ["--provider <PROVIDER>", "Model provider to use."],
  ],
};

export default generateCommand;
