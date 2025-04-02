import * as dotenv from "dotenv";
import { join } from "path";
import { homedir } from "os";
import { CONFIG_FILENAME } from "./config";
import { name } from "../package.json";

dotenv.config({
  path: join(homedir(), ".config/", name, CONFIG_FILENAME),
});

interface Settings {
  [key: string]: string | boolean | undefined;
}

const defaultSettings: Settings = {
  provider: "GOOGLE",
  skipPackageIfTestsExists: true,
};

export const settings: Settings = { ...process.env, ...defaultSettings };
