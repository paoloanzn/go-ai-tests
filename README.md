# go-ai-tests

A command-line tool for automatically generating Go unit tests using AI models.

## Motivation

Writing comprehensive unit tests for Go packages can be time-consuming and repetitive. GO-AI-TESTS solves this problem by leveraging AI models to automatically generate high-quality test files for your Go code. This tool analyzes your Go packages and creates appropriate test cases for functions that don't already have tests.

## Features

- Automatically generates test files for Go packages
- Supports different AI models providers. 
- Respects existing test files (won't overwrite them)
- Creates comprehensive tests with both happy paths and edge cases
- Simple command-line interface

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/go-ai-tests.git

# Navigate to the project directory
cd go-ai-tests

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm install -g .
```

## Configuration

Before using the tool, you need to configure your AI provider API keys:

```bash
go-ai-tests config
```

This will prompt you to:
1. Select an AI provider (Google or OpenAI)
2. Enter your API key

The configuration is stored in `~/.config/go-ai-tests/config.env`.

## Usage

### Generate Tests

To generate tests for a Go project:

```bash
go-ai-tests generate <project> 
```

Where `<project>` is the path to your Go project. By default, it will:
- Find all Go packages in the project
- Skip packages that already have test files
- Generate test files for packages without tests

#### Options

- `--exclude `: Comma-separated list of paths to exclude
- `--provider `: Override the default AI provider (GOOGLE or OPENAI)

Example:

```bash
go-ai-tests generate . --exclude vendor,examples --provider OPENAI
```

## How It Works

1. The tool scans your Go project to identify all packages
2. It filters out packages that already have test files
3. For each package without tests, it:
   - Reads and formats all Go source files
   - Sends the code to the configured AI model
   - Generates appropriate test functions
   - Writes the test file to disk

## License

ISC

## Author

- Paolo Anzani 
- <anzanipaolo.enquires@gmail.com>