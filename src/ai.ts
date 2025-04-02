import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { Schema, z } from "zod";
import chalk from "chalk";
const { Tiktoken } = require("tiktoken/lite");
const cl100k_base = require("tiktoken/encoders/cl100k_base.json");

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
  temperature?: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  topP?: number;
  topK?: number;
}

export interface AiOptions {
  modelProvider: string;
  modelName: string;
  prompt: string;
  apiKey?: string;
  modelSettings?: ModelSettings;
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
    case "GOOGLE":
      return await handleGoogleProvider(options);
    // TODO: Add more provider support: OPENAI, ANTROPHIC, DEEPSEEK and more...
    default:
      console.log(
        chalk.red(`Error: model provider ${modelProvider} not supported.`)
      );
      process.exit(1);
  }
}

async function handleGoogleProvider({
  modelName,
  modelSettings,
  prompt,
  schema,
  apiKey,
}: AiOptions) {
  if (!apiKey) {
    console.log(chalk.red(`Error: api key required for GOOGLE provider`));
    process.exit(1);
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  const model = google(modelName);

  const {
    temperature,
    maxOutputTokens,
    maxInputTokens,
    presencePenalty,
    frequencyPenalty,
    topP,
    topK,
  } = { ...modelSettings };

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
      temperature: temperature ?? 0.7,
      maxTokens: maxOutputTokens,
      presencePenalty,
      frequencyPenalty,
      topP,
      topK,
    });

    return object;
  } catch (error: any) {
    console.log(chalk.red(`Error generating object, skipping.`));
    return null;
  }
}
