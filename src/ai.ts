import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { Schema, z } from "zod";
import chalk from "chalk";
import { createOpenAI } from "@ai-sdk/openai";
import { settings } from "./settings";
const { Tiktoken } = require("tiktoken/lite");
const cl100k_base = require("tiktoken/encoders/cl100k_base.json");

export enum ModelProviderName {
  OPENAI = "OPENAI",
  GOOGLE = "GOOGLE",
}

export enum ModelClass {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export type Model = {
  model: {
    [ModelClass.SMALL]: ModelSettings;
    [ModelClass.MEDIUM]: ModelSettings;
    [ModelClass.LARGE]: ModelSettings;
  };
};

export type Models = {
  [ModelProviderName.OPENAI]: Model;
  [ModelProviderName.GOOGLE]: Model;
};

export const models: Models = {
  [ModelProviderName.OPENAI]: {
    model: {
      [ModelClass.SMALL]: {
        name: "gpt-4o-mini",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
      [ModelClass.MEDIUM]: {
        name: "gpt-4o",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
      [ModelClass.LARGE]: {
        name: "o3-mini-2025-01-31",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
    },
  },

  [ModelProviderName.GOOGLE]: {
    model: {
      [ModelClass.SMALL]: {
        name: "gemini-2.0-flash-lite",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
      [ModelClass.MEDIUM]: {
        name: "gemini-2.0-flash",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
      [ModelClass.LARGE]: {
        name: "gemini-2.5-pro-exp-03-25",
        temperature: 0.6,
        maxInputTokens: 128000,
        maxOutputTokens: 8192,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
      },
    },
  },
};

const countToken = async (text: string): Promise<number> => {
  const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
  );
  const tokens = encoding.encode(text);
  encoding.free();

  return tokens.length;
};

export interface ModelSettings {
  name: string;
  temperature?: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  topP?: number;
  topK?: number;
}

export interface AiOptions {
  modelProvider: ModelProviderName;
  prompt: string;
  modelClass: ModelClass;
  schema?: Schema;
}

export async function aiGenerateObject(options: AiOptions) {
  const { modelProvider, schema } = options;
  if (!schema) {
    options.schema = z.object({
      output: z.string(),
    });
  }

  switch (modelProvider) {
    case ModelProviderName.GOOGLE:
      return await handleGoogleProvider(options);
    case ModelProviderName.OPENAI:
      return await handleOpenAIProvider(options);
    default:
      console.log(
        chalk.red(`Error: model provider ${modelProvider} not supported.`)
      );
      process.exit(1);
  }
}

async function handleOpenAIProvider({
  modelClass,
  prompt,
  schema,
}: AiOptions) {
  const apiKey = settings.OPENAI_API_KEY as string;
  if (!apiKey) {
    console.log(chalk.red(`Error: api key required for OPENAI provider`));
    process.exit(1);
  }

  const openai = createOpenAI({
    apiKey,
  });

  const {
    name,
    temperature,
    maxOutputTokens,
    maxInputTokens,
    presencePenalty,
    frequencyPenalty,
  } = { ...models[ModelProviderName.OPENAI].model[modelClass] };

  const model = openai(name);

  if (maxInputTokens) {
    const tokenCount = await countToken(prompt);
    if (tokenCount > maxInputTokens) {
      console.log(
        chalk.red(
          `Error: input token count exceed the limit of ${maxInputTokens}: ${tokenCount}`
        )
      );
      process.exit(1);
    }
  }

  try {
    const { object } = await generateObject({
      model,
      prompt,
      schema: schema as Schema,
      temperature,
      maxTokens: maxOutputTokens,
      presencePenalty,
      frequencyPenalty,
    });

    return object;
  } catch (error: any) {
    console.log(chalk.red(`Error generating object: ${error}`));
    process.exit(1) 
  }
}

async function handleGoogleProvider({
    modelClass,
  prompt,
  schema,
}: AiOptions) {
  const apiKey = settings.GOOGLE_GENERATIVE_AI_API_KEY as string;
  if (!apiKey) {
    console.log(chalk.red(`Error: api key required for GOOGLE provider`));
    process.exit(1);
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  const {
    name,
    temperature,
    maxOutputTokens,
    maxInputTokens,
    presencePenalty,
    frequencyPenalty,
  } = { ...models[ModelProviderName.GOOGLE].model[modelClass] };

  const model = google(name);

  if (maxInputTokens) {
    const tokenCount = await countToken(prompt);
    if (tokenCount > maxInputTokens) {
      console.log(
        chalk.red(
          `Error: input token count exceed the limit of ${maxInputTokens}: ${tokenCount}`
        )
      );
      process.exit(1);
    }
  }

  try {
    const { object } = await generateObject({
      model,
      prompt,
      schema: schema as Schema,
      temperature,
      maxTokens: maxOutputTokens,
      presencePenalty,
      frequencyPenalty,
    });

    return object;
  } catch (error: any) {
    console.log(chalk.red(`Error generating object: ${error}`));
    process.exit(1)
  }
}
