import chalk from "chalk";
import { CommandData } from "./command";
import inquirer, { Question } from "inquirer";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { name } from "../package.json";
import { settings } from "./settings";

export const CONFIG_FILENAME = "config.env";

async function getConfigFile(): Promise<any> {
  const programName = name;
  const directoryPath = join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".config",
    programName
  );

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }

  const configFilePath = join(directoryPath, CONFIG_FILENAME);

  const savedConfig: Record<string, any> = {};
  if (existsSync(configFilePath)) {
    const configFileContent = readFileSync(configFilePath, "utf-8");

    configFileContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      savedConfig[key] = value;
    });
  }

  return { configFilePath, savedConfig };
}

interface ConfigEntry {
  name: string;
  value: string | boolean | number | undefined;
}

async function addEntriesToConfigFile(entries: ConfigEntry[]) {
  const { savedConfig, configFilePath } = await getConfigFile();

  if (settings.LOG_LEVEL === "DEBUG") {
    console.log(
      chalk.magenta(`LOADED CONFIG:\n${JSON.stringify(savedConfig)}`)
    );
  }

  entries.forEach((entry) => {
    const { name, value } = entry;
    savedConfig[name] = value;
  });

  const formattedContent = (config: Record<string, any>) => {
    let formattedContent = "";
    for (const key in config) {
      formattedContent += `${key}=${config[key]}\n`;
    }
    return formattedContent;
  };

  writeFileSync(configFilePath, formattedContent(savedConfig), "utf-8");
}

const createConfig = async () => {
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Select a provider:",
      choices: ["Google", "OpenAI"],
    },
  ]);

  const { value } = await inquirer.prompt([
    {
      type: "input",
      name: "value",
      message: "Enter API KEY:",
    },
  ]);

  switch (choice.toUpperCase()) {
    case "GOOGLE":
      await addEntriesToConfigFile([
        {
          name: "GOOGLE_GENERATIVE_AI_API_KEY",
          value,
        },
      ]);
      break;

    case "OPENAI":
      await addEntriesToConfigFile([
        {
          name: "OPENAI_API_KEY",
          value,
        },
      ]);
      break;
    default:
      process.exit(1);
  }

  return;
};

const configCommand: CommandData = {
  name: "config",
  definition: "config",
  description: "Generate tests for a give project.",
  action: createConfig,
};

export default configCommand;
