#!/usr/bin/env node --disable-warning=ExperimentalWarning

import { Command } from 'commander';
import { CommandData, initCommands } from './command';
import { version } from '../package.json'

const program = new Command();

program
  .name('go-ai-tests')
  .description('Generate Go tests file using ai.')
  .version(version);

const commands: CommandData[] = []

import generateCommand from './generateTests';
commands.push(generateCommand)

initCommands(commands, program)

program.parse(process.argv);
