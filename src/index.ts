#!/usr/bin/env node

import { Command } from 'commander';
import { CommandData, initCommands } from './command';

const program = new Command();

program
  .name('go-ai-tests')
  .description('Generate Go tests file using ai.')
  .version('1.0.0');

const commands: CommandData[] = []

import generateCommand from './generateTests';
commands.push(generateCommand)

initCommands(commands, program)

program.parse(process.argv);
