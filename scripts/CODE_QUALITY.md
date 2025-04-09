# Code Quality Framework

## Overview

The Code Quality Framework provides a comprehensive solution for maintaining high standards in your codebase through automated checks and reporting. It's designed to be flexible enough to adapt to various project types while providing consistent quality enforcement.

The Code Quality Framework automates essential code quality checks within your project, ensuring adherence to formatting standards, linting rules, type safety, and successful builds. It provides a unified script (`npm run cq`) to run these checks either sequentially or in parallel. The framework intelligently captures output from failed checks, categorizes errors based on configurable patterns, and presents a consolidated summary for easier debugging and resolution. Integrating this into your CI pipeline helps consistently maintain high code quality standards.

## Key Features

The framework offers these core capabilities:

- **Automated Checks:** Runs formatter, linter, type checker, and build commands.
- **Flexible Execution:** Supports both sequential and parallel execution of checks.
- **Consolidated Reporting:** Provides a clear summary of failed checks and their output.
- **Error Categorization:** Groups errors based on configurable patterns with custom suggestions.
- **Easy Integration:** Designed for simple setup and use in local development and CI pipelines.
- **Configurable:** Uses an optional `.code-quality.json` file for advanced customization.

## Prerequisites

Before implementing the framework, ensure your development environment meets these requirements:

- **Node.js:** Required to run the script and associated tools.
- **Package Manager:** npm, yarn, pnpm, or bun.
- **Project-Specific Tools:** Your project must have its own chosen tools installed and configured for:

  - Formatting (e.g., Prettier)
  - Linting (e.g., ESLint)
  - Type Checking (e.g., TypeScript's `tsc`)
  - Building (e.g., Vite, Webpack, `tsc`)

## Installation

To get started with the framework, follow these installation steps:

The framework script relies on `chalk` for colorful console output. Install it as a development dependency:

```bash
npm install --save-dev chalk
# or
yarn add --dev chalk
# or
pnpm add --save-dev chalk
# or
bun add --dev chalk
```

Ensure your project's formatter, linter, type checker, and build tool are also installed as development dependencies.

## Setup

Follow these steps to integrate the Code Quality Framework into your project:

### Step 1: Create the Framework Script

Create a file named `code-quality.js` inside a `scripts` directory in your project root (`scripts/code-quality.js`). Paste the following code into the file. This script reads the optional configuration file and executes the checks.

```javascript
// scripts/code-quality.js
import chalk from 'chalk';
import { exec } from 'child_process'; // Removed unused execSync
import fs from 'fs';
import path from 'path';

// --- Configuration Loading ---
const CONFIG_FILE_PATH = path.resolve('.code-quality.json');
const DEFAULT_COMMANDS = ['npm run format', 'npm run lint', 'npx tsc --noEmit', 'npm run build'];
const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes default timeout per command

let config = {
  parallel: false,
  commands: [...DEFAULT_COMMANDS], // Use a copy of defaults
  errorCategories: {},
  commandTimeout: DEFAULT_TIMEOUT_MS, // Add configurable timeout
  stopOnFail: false, // New option: Stop sequential runs on first failure
};

try {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    const rawConfig = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const loadedConfig = JSON.parse(rawConfig);

    // Merge loaded config with defaults carefully
    config = {
      ...config, // Start with defaults
      ...loadedConfig, // Override with loaded values
      // Ensure commands is a non-empty array, otherwise use default
      commands:
        loadedConfig.commands &&
        Array.isArray(loadedConfig.commands) &&
        loadedConfig.commands.length > 0
          ? loadedConfig.commands
          : [...DEFAULT_COMMANDS],
      // Ensure commandTimeout is a positive number, otherwise use default
      commandTimeout:
        typeof loadedConfig.commandTimeout === 'number' && loadedConfig.commandTimeout > 0
          ? loadedConfig.commandTimeout
          : DEFAULT_TIMEOUT_MS,
      // Ensure parallel and stopOnFail are booleans
      parallel:
        typeof loadedConfig.parallel === 'boolean' ? loadedConfig.parallel : config.parallel,
      stopOnFail:
        typeof loadedConfig.stopOnFail === 'boolean' ? loadedConfig.stopOnFail : config.stopOnFail,
      // Ensure errorCategories is an object
      errorCategories:
        typeof loadedConfig.errorCategories === 'object' && loadedConfig.errorCategories !== null
          ? loadedConfig.errorCategories
          : {},
    };
    console.log(chalk.dim(`Loaded configuration from ${path.basename(CONFIG_FILE_PATH)}`));
  } else {
    console.log(chalk.dim(`No ${path.basename(CONFIG_FILE_PATH)} found, using default settings.`));
  }
} catch (error) {
  console.error(
    chalk.red(`Error reading or parsing ${path.basename(CONFIG_FILE_PATH)}: ${error.message}`)
  );
  console.log(chalk.yellow('Falling back to default settings.'));
  // Ensure config retains defaults if parsing failed badly
  config = {
    parallel: false,
    commands: [...DEFAULT_COMMANDS],
    errorCategories: {},
    commandTimeout: DEFAULT_TIMEOUT_MS,
    stopOnFail: false,
    ...config, // Keep any potentially valid parts parsed before error
    commands:
      config.commands && config.commands.length > 0 ? config.commands : [...DEFAULT_COMMANDS], // Re-validate commands
  };
}

const {
  commands: commandsToRun,
  parallel: runInParallel,
  errorCategories,
  commandTimeout,
  stopOnFail,
} = config;

// --- Execution Logic ---
const failedCommandDetails = []; // Stores { cmd: string, errorOutput: string, category?: string, suggestion?: string, timedOut?: boolean }
const MAX_SUMMARY_OUTPUT_LENGTH = 1000; // Limit output length in summary

// Function to categorize errors based on configured patterns
function categorizeError(output) {
  for (const categoryName in errorCategories) {
    const category = errorCategories[categoryName];
    if (category.patterns && Array.isArray(category.patterns)) {
      for (const pattern of category.patterns) {
        try {
          // Allow flags in the pattern string itself, e.g., "/pattern/gi"
          let regex;
          const match = pattern.match(/^\/(.+)\/([gimyus]*)$/);
          if (match) {
            regex = new RegExp(match[1], match[2] || '');
          } else {
            // Default to case-insensitive if no flags provided
            regex = new RegExp(pattern, 'i');
          }

          if (regex.test(output)) {
            return { category: categoryName, suggestion: category.suggestion };
          }
        } catch (e) {
          console.warn(
            chalk.yellow(
              `! Invalid regex pattern "${pattern}" for category "${categoryName}": ${e.message}`
            )
          );
        }
      }
    }
  }
  return {}; // No category matched
}

// Function to run a single command with timeout and error handling
function runCommand(cmd) {
  return new Promise(resolve => {
    const stepStartTime = Date.now();
    // Use simpler symbols for better terminal compatibility
    console.log(chalk.blue(`▶ Running: ${chalk.bold(cmd)}`));

    const child = exec(
      cmd,
      { encoding: 'utf8', timeout: commandTimeout },
      (error, stdout, stderr) => {
        const stepEndTime = Date.now();
        const duration = ((stepEndTime - stepStartTime) / 1000).toFixed(2);
        const output = (stderr || '') + (stdout || ''); // Combine streams for comprehensive error checking
        const timedOut = error?.signal === 'SIGTERM'; // Check if killed due to timeout

        if (error) {
          const failureMsg = timedOut ? `Timeout after ${commandTimeout / 1000}s` : `Failed`;
          console.error(
            chalk.red(`✘ ${failureMsg}: ${chalk.bold(cmd)}`) + chalk.gray(` (${duration}s)\n`)
          );

          // Show immediate snippet of the error
          const errorSnippet = (output.trim() || error.message).substring(0, 300);
          console.error(
            chalk.gray(
              `  Error snippet: ${errorSnippet}${errorSnippet.length === 300 ? '...' : ''}\n`
            )
          );

          const { category, suggestion } = categorizeError(output);
          failedCommandDetails.push({
            cmd: cmd,
            errorOutput: output.trim() || error.message, // Store full output
            category,
            suggestion,
            timedOut,
          });
          resolve(false); // Indicate failure
        } else {
          console.log(
            chalk.green(`✔ Success: ${chalk.bold(cmd)}`) + chalk.gray(` (${duration}s)\n`)
          );
          resolve(true); // Indicate success
        }
      }
    );

    // Optional: Log stdout/stderr in real-time if needed (can be verbose)
    // child.stdout.pipe(process.stdout);
    // child.stderr.pipe(process.stderr);
  });
}

// Main execution function
(async () => {
  console.log(chalk.cyan.bold('\n--- Starting Code Quality Checks ---\n'));
  const startTime = Date.now();
  let allPassed = true;
  let checksCompleted = 0;

  if (runInParallel) {
    console.log(chalk.cyan(`⚡ Running ${commandsToRun.length} checks in parallel...\n`));
    const results = await Promise.all(commandsToRun.map(runCommand));
    allPassed = results.every(passed => passed);
    checksCompleted = commandsToRun.length;
  } else {
    console.log(chalk.cyan(`→ Running ${commandsToRun.length} checks sequentially...\n`));
    for (let i = 0; i < commandsToRun.length; i++) {
      const cmd = commandsToRun[i];
      console.log(chalk.gray(`[${i + 1}/${commandsToRun.length}]`)); // Show progress
      const passed = await runCommand(cmd);
      checksCompleted++;
      if (!passed) {
        allPassed = false;
        if (stopOnFail) {
          console.log(
            chalk.yellow(
              `\n⚠️ Stopping sequential run due to failure on '${cmd}' (stopOnFail=true).\n`
            )
          );
          break; // Stop processing further commands
        }
      }
    }
  }

  // --- Summary Section ---
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
  const resultMessage = allPassed
    ? chalk.green.bold('✔ All checks passed successfully!')
    : chalk.red.bold(`✘ ${failedCommandDetails.length} check(s) failed.`);

  console.log(chalk.cyan.bold(`\n--- Code Quality Checks Complete ---`));
  console.log(`Ran ${checksCompleted}/${commandsToRun.length} checks in ${totalDuration}s.`);
  console.log(`${resultMessage}\n`);

  if (!allPassed) {
    console.error(chalk.yellow.bold('--- Failure Analysis Summary ---'));

    const categorizedFailures = {};
    const uncategorizedFailures = [];

    failedCommandDetails.forEach(failure => {
      if (failure.category) {
        if (!categorizedFailures[failure.category]) {
          categorizedFailures[failure.category] = { suggestion: failure.suggestion, failures: [] };
        }
        categorizedFailures[failure.category].failures.push(failure);
      } else {
        uncategorizedFailures.push(failure);
      }
    });

    // Function to print failure details with truncation
    const printFailure = failure => {
      const reason = failure.timedOut ? chalk.magenta('(Timed Out)') : '';
      console.error(chalk.red(`\n▼ Command: ${chalk.bold(failure.cmd)} ${reason}`));
      const outputToShow = failure.errorOutput.substring(0, MAX_SUMMARY_OUTPUT_LENGTH);
      console.error(chalk.white(outputToShow));
      if (failure.errorOutput.length > MAX_SUMMARY_OUTPUT_LENGTH) {
        console.error(
          chalk.gray(
            `\n[... Output truncated in summary. Scroll up for full output from the command execution. ...]`
          )
        );
      }
      console.error(chalk.yellow('▲ End of Summary Output'));
    };

    // Print categorized errors first
    for (const categoryName in categorizedFailures) {
      const categoryData = categorizedFailures[categoryName];
      console.error(chalk.magenta.bold(`\n--- Category: ${categoryName} ---`));
      if (categoryData.suggestion) {
        console.error(chalk.cyan(`💡 Suggestion: ${categoryData.suggestion}`));
      }
      categoryData.failures.forEach(printFailure);
    }

    // Print uncategorized errors
    if (uncategorizedFailures.length > 0) {
      console.error(chalk.magenta.bold(`\n--- Uncategorized Errors ---`));
      uncategorizedFailures.forEach(printFailure);
    }

    console.error(chalk.yellow.bold('\n------------------------------'));
    console.error(
      chalk.yellow('Please review the summary above or scroll up for full command output.')
    );
    process.exit(1); // Exit with failure code
  } else {
    process.exit(0); // Exit with success code
  }
})();
```

### Step 2: Configure package.json

Add or ensure the following scripts exist in your `package.json` file. Crucially, adapt the `format`, `lint`, `typecheck`, and `build` scripts to match the commands for your project's specific tools and configurations.

```json
{
  "scripts": {
    // 1. Define your project's specific quality check commands:
    //    (Adapt these examples to your tools and config)
    "format": "prettier --write .",
    "lint": "eslint . --max-warnings=0", // Use --max-warnings=0 to treat warnings as errors for the summary
    "typecheck": "tsc --noEmit",
    "build": "vite build", // Or: "webpack build", "tsc", etc.

    // 2. Add the framework runner script:
    "cq": "node scripts/code-quality.js"
  }
}
```

### Step 3: (Optional) Create Configuration File

For advanced customization (parallel execution, custom commands, error categorization), create a file named `.code-quality.json` in your project root. If this file exists, the script will use its settings; otherwise, it uses the defaults defined within the script.

Here's an example structure:

```json
{
  "parallel": true,
  "commands": ["npm run format", "npm run lint", "npm run typecheck", "npm run build"],
  "errorCategories": {
    "style": {
      "patterns": ["eslint", "prettier", "stylelint"],
      "suggestion": "Run formatters/linters and fix style issues."
    },
    "types": {
      "patterns": ["TS\\\\d+", "error TS", "Type error:"],
      "suggestion": "Check TypeScript types, annotations, and configurations."
    },
    "build": {
      "patterns": ["build failed", "vite", "webpack", "compilation error"],
      "suggestion": "Review build configuration and resolve compilation errors."
    }
  }
}
```

See the Configuration Details section below for more information on these options.

## Usage

Run the code quality checks using your package manager:

```shell
npm run cq
# or
yarn cq
# or
pnpm cq
# or
bun cq
```

The script will execute the configured checks (sequentially by default, or in parallel if configured) and report a summary of any failures.

## How it Works

**Configuration:** The script first looks for a `.code-quality.json` file in the project root. If found, it loads the configuration for parallel execution, commands, and error categories. If not found, it uses hardcoded defaults.

**Execution:** It runs the specified commands either one after another (sequentially) or all at once (in parallel) based on the configuration.

**Output Capture:** For each command, it captures `stdout` and `stderr`.

**Status Tracking:** It logs the success or failure of each command. If a command fails, its name and output are stored.

**Error Categorization:** If error categories are defined in the config, the script attempts to match the output of failed commands against the defined regex patterns to assign a category and suggestion.

**Summary Report:** After all commands finish, it prints a final status. If any command failed, it displays a detailed summary, grouping errors by category (if applicable) and showing the captured output for each failed command.

**Exit Code:** Exits with code 0 on success and 1 on failure, making it suitable for CI environments.

## Configuration Details (.code-quality.json)

The optional `.code-quality.json` file allows fine-tuning the framework:

### `parallel` (boolean)

- `true`: Run the commands concurrently. Faster on multi-core systems but output might be interleaved.
- `false` (Default): Run commands sequentially, one after the other. Easier to follow logs for individual steps.

### `commands` (array of strings)

An array of the exact commands to execute. These should correspond to scripts in your `package.json` or direct CLI calls (like `npx tsc --noEmit`).

If this array is missing or empty in the config file, the script falls back to its default command list.

### `errorCategories` (object)

An object where each key is a category name (e.g., `"style"`, `"types"`).

Each category value is an object with:

- `patterns` (array of strings): An array of JavaScript-compatible regular expression patterns (as strings) to match against the error output. Use `\\\\` to escape special regex characters if needed within the JSON string.
- `suggestion` (string): A helpful message displayed in the summary when an error matches this category.

### Example Categories

```json
{
  // ... other config ...
  "errorCategories": {
    "style": {
      "patterns": ["eslint", "prettier", "[Ss]tyle.*rule"], // Matches 'eslint', 'prettier', 'Style rule', 'style rule' etc.
      "suggestion": "Review code style guidelines and run formatting/linting tools."
    },
    "types": {
      "patterns": ["TS\\\\d+", "[Tt]ype.*error"], // Matches TypeScript error codes (TSxxxx) or phrases like 'Type error'
      "suggestion": "Fix type inconsistencies, check interfaces/types, and ensure correct type annotations."
    },
    "build": {
      "patterns": ["build.*failed", "webpack", "vite", "[Cc]ompilation"], // Matches 'build failed', tool names, 'Compilation' etc.
      "suggestion": "Check build configuration (e.g., vite.config.js, webpack.config.js) and resolve compilation errors."
    },
    "testing": {
      "patterns": ["Test suite failed", "Jest", "Vitest", "\\\\d+ failed"], // Matches common testing framework outputs
      "suggestion": "Review failing tests, check test setup and assertions."
    }
  }
}
```

## Best Practices

**Command Configuration:** Ensure the commands listed in `package.json` (and potentially overridden in `.code-quality.json`) correctly invoke your project's tools with the desired flags (e.g., `eslint --max-warnings=0` to make lint warnings fail the check).

**Parallel Execution:** Enable parallel execution (`"parallel": true`) in CI environments to potentially speed up checks. Consider keeping it sequential (`"parallel": false`) for local development if interleaved output is confusing.

**Error Categories:** Define specific categories relevant to your project (e.g., accessibility, security, testing). Use precise regex patterns. Provide actionable suggestions.

**CI Integration:** Use the `npm run cq` command as a step in your CI pipeline (GitHub Actions, GitLab CI, etc.) to enforce quality checks automatically.

## CI Integration Example (GitHub Actions)

```yaml
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18' # Or your project's required version
          cache: 'npm' # Or yarn, pnpm, bun

      - name: Install Dependencies
        run: npm install # Or yarn install, pnpm install, bun install

      - name: Run Code Quality Checks
        run: npm run cq # Executes the framework script
```

## Troubleshooting

**Command Not Found:** Ensure the commands listed in `package.json` or `.code-quality.json` are correct and the corresponding tools are installed.

**Parallel Issues:** If parallel execution causes unexpected behavior or race conditions, switch to sequential (`"parallel": false`) for debugging.

**Regex Errors:** Check the console output for warnings about invalid regex patterns in your `.code-quality.json`. Ensure patterns are valid JavaScript regex strings.

**Categorization Not Working:** Verify that the regex patterns accurately match the error messages produced by your tools. Test patterns using online regex testers if needed. Remember matching is case-insensitive.
