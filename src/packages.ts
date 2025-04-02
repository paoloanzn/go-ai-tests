import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GoPackage {
    name: string;
    dirPath: string;
    files: string[]
}

const buildCommand = (
    path: string
): string => {
    return `cd ${path} && go env MOD && go list ./...`
}

const filesInDirectory = (
    dirPath: string
): string[] => {
    const files = fs.readdirSync(dirPath)

    if (files.length === 0) {
        console.log(chalk.yellow(`Warning: No file found in ${dirPath}`)) 
    }

    const filteredFiles: string[] = []

    files.forEach(fileName => {
        if (fileName.endsWith('.go')) {
            filteredFiles.push(path.join(dirPath, fileName))
        }
    });

    return filteredFiles
}

const execAsync = promisify(exec);

export async function findPackages(dirPath: string) {
  try {
    const { stdout } = await execAsync(buildCommand(dirPath));
    const packages = stdout.trim().split('\n')

    const expandedPath = dirPath.replace('~', os.homedir())
    const baseSegment = path.basename(expandedPath)
    const packagesDirPaths: string[] = []
    packages.forEach((packageName) => {
        const splitIndex = packageName.indexOf(`/${baseSegment}/`)
        if (splitIndex === -1) {
            console.log(chalk.yellow(`Warning: No directory found for package: ${packageName}`))
            return
        }
        const extractedPart = packageName.substring(splitIndex + `/${baseSegment}/`.length)
        packagesDirPaths.push(path.join(expandedPath, extractedPart))
    })

    const goPackages: GoPackage[] = []
    packagesDirPaths.forEach((dirPath) => {
        const goPackage = {
            name: dirPath,
            dirPath,
            files: filesInDirectory(dirPath)
        }

        goPackages.push(goPackage)
    })

    return { packagesDirPaths, goPackages }
  } catch (error) {
    console.log(chalk.red(`Execution error: ${error}`));
    process.exit(1)
  }
}
