Refactor the code-quality.js script into a more robust, modular, and maintainable structure suitable for an enterprise environment.

Key Improvements:

Modular Structure: Break down the script into logical units (config loading, command execution, reporting, error categorization) for better organization and testability.
Robust Configuration: Use a schema validation library (like zod) to ensure the configuration file is correctly structured and typed. Define a clearer schema for checks.
Improved Process Execution: Switch from exec to spawn. spawn is generally preferred for long-running processes or potentially large outputs as it works with streams and avoids buffer limitations inherent in exec. It also provides better control over the child process.
Dedicated Reporter: Create a Reporter class to handle all console output. This centralizes formatting and makes it easier to customize or even swap out reporting mechanisms later (e.g., JSON output for CI).
Clearer State Management: Explicitly track the state of each command execution (success, failure, output, duration, timeout).
Enhanced Error Handling: More specific error handling during config loading and command execution.
Testability: The modular design makes individual components easier to unit test.
Type Safety (Conceptual): While still JavaScript, using zod for config validation adds a layer of type safety at the boundary. Adding JSDoc comments improves developer understanding.
Refactored Code Structure (Conceptual Files):

For clarity, I'll present the code as if it were split into multiple files. You can combine them or keep them separate in your project.

config/schema.js (Defines the configuration schema)
config/loader.js (Loads and validates configuration)
utils/errorCategorizer.js (Handles error categorization)
runner/commandRunner.js (Executes individual commands using spawn)
reporting/reporter.js (Handles all console output)
scripts/code-quality.js (Main script orchestrating the process)
.code-quality.json (Example configuration file)
package.json (Add zod dependency)

1. package.json (Add Dependency)

Make sure to install zod:

bash
npm install zod --save-dev

# or

yarn add zod --dev
Add it to your devDependencies:

json
// package.json
{
// ... other config
"devDependencies": {
"chalk": "^5.3.0", // Or your current version
"zod": "^3.22.4", // Add zod
// ... other devDependencies
}
} 2. config/schema.js

javascript
// config/schema.js
import { z } from 'zod';

export const DEFAULT_COMMAND_TIMEOUT_MS = 300000; // 5 minutes
export const DEFAULT_COMMANDS_CONFIG = [
{ id: 'format', name: 'Formatting (Prettier)', command: 'npm run format' },
{ id: 'lint', name: 'Linting (ESLint)', command: 'npm run lint' },
{ id: 'typecheck', name: 'Type Checking (TSC)', command: 'npx tsc --noEmit' },
{ id: 'build', name: 'Build Project', command: 'npm run build' },
];

// Schema for a single check/command
const CommandCheckSchema = z.object({
id: z.string().min(1).describe('Unique identifier for the check'),
name: z.string().min(1).describe('Human-readable name for the check'),
command: z.string().min(1).describe('The shell command to execute'),
timeout: z.number().positive().optional().describe('Optional timeout in milliseconds for this specific command'),
// Future potential options: retries, environment variables, working directory etc.
});

// Schema for error categorization rules
const ErrorCategorySchema = z.object({
patterns: z.array(z.string().min(1)).min(1).describe('Array of regex patterns (strings) to match against command output'),
suggestion: z.string().optional().describe('Optional suggestion to display when this category matches'),
});

// Main configuration schema
export const ConfigSchema = z.object({
runInParallel: z.boolean().default(false).describe('Whether to run checks in parallel'),
stopOnFail: z.boolean().default(false).describe('In sequential mode, stop execution on the first failure'),
commandTimeout: z.number().positive().default(DEFAULT_COMMAND_TIMEOUT_MS).describe('Default timeout in milliseconds for each command'),
checks: z.array(CommandCheckSchema).min(1).default(DEFAULT_COMMANDS_CONFIG).describe('List of checks to perform'),
errorCategories: z.record(ErrorCategorySchema).default({}).describe('Rules for categorizing command failures based on output patterns'),
});

// Infer the TypeScript type from the schema
export const Config = ConfigSchema.parse({}); // Creates a default object for type inference
// Type definition for Config
// export type Config = z.infer<typeof ConfigSchema>; 3. config/loader.js

javascript
// config/loader.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { z } from 'zod';
import { ConfigSchema, DEFAULT_COMMANDS_CONFIG, DEFAULT_COMMAND_TIMEOUT_MS } from './schema.js';

const CONFIG_FILE_PATH = path.resolve('.code-quality.json');

/\*\*

- Loads, validates, and merges configuration.
- @returns {Promise<import('./schema.js').Config>} The validated configuration object.
- @throws {Error} If configuration is invalid.
  \*/
  export async function loadConfig() {
  let loadedConfig = {};
  const configExists = fs.existsSync(CONFIG_FILE_PATH);

if (configExists) {
console.log(chalk.dim(`Attempting to load configuration from ${path.basename(CONFIG_FILE_PATH)}...`));
try {
const rawConfig = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
loadedConfig = JSON.parse(rawConfig);
} catch (error) {
console.error(chalk.red(`Error reading or parsing ${path.basename(CONFIG_FILE_PATH)}:`), error);
throw new Error(`Failed to load configuration file: ${error.message}`);
}
} else {
console.log(chalk.dim(`No ${path.basename(CONFIG_FILE_PATH)} found, using default settings.`));
}

try {
// Validate and merge with defaults using Zod
const finalConfig = ConfigSchema.parse(loadedConfig);

    if (configExists) {
        console.log(chalk.dim(`Configuration loaded and validated successfully.`));
    }

    // Log effective settings (optional but helpful)
    console.log(chalk.dim(`Effective Settings: Parallel=${finalConfig.runInParallel}, StopOnFail=${finalConfig.stopOnFail}, Default Timeout=${finalConfig.commandTimeout/1000}s, Checks=${finalConfig.checks.length}`));

    return finalConfig;

} catch (error) {
if (error instanceof z.ZodError) {
console.error(chalk.red.bold('Configuration validation failed:'));
error.errors.forEach(err => {
console.error(chalk.red(`  - Path: [${err.path.join('.') || 'root'}] - ${err.message}`));
});
} else {
console.error(chalk.red('An unexpected error occurred during configuration processing:'), error);
}
throw new Error('Invalid configuration.');
}
} 4. utils/errorCategorizer.js

javascript
// utils/errorCategorizer.js
import chalk from 'chalk';

/\*\*

- @typedef {import('../config/schema.js').Config['errorCategories']} ErrorCategories
  \*/

/\*\*

- Attempts to categorize a command failure based on its output and configured patterns.
- @param {string} output - The combined stdout/stderr from the failed command.
- @param {ErrorCategories} errorCategories - The categorization rules from the config.
- @returns {{ category?: string, suggestion?: string }} - The matched category and suggestion, or empty object.
  \*/
  export function categorizeError(output, errorCategories) {
  if (!output || typeof errorCategories !== 'object' || errorCategories === null) {
  return {};
  }

for (const categoryName in errorCategories) {
const category = errorCategories[categoryName];
if (category?.patterns && Array.isArray(category.patterns)) {
for (const pattern of category.patterns) {
try {
let regex;
const match = pattern.match(/^\/(.+)\/([gimyus]\*)$/); // Support /pattern/flags format
if (match) {
regex = new RegExp(match[1], match[2] || '');
} else {
regex = new RegExp(pattern, 'i'); // Default to case-insensitive
}

          if (regex.test(output)) {
            return { category: categoryName, suggestion: category.suggestion };
          }
        } catch (e) {
          // Warn once per invalid pattern? Could add caching/tracking if needed.
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
} 5. runner/commandRunner.js

javascript
// runner/commandRunner.js
import { spawn } from 'child_process';
import chalk from 'chalk';

/\*\*

- @typedef {import('../config/schema.js').Config['checks'][0]} CheckConfig
  \*/

/\*\*

- @typedef {object} CommandResult
- @property {boolean} success - Whether the command exited with code 0.
- @property {string} output - Combined stdout and stderr.
- @property {number | null} exitCode - The exit code of the process.
- @property {string | null} signal - The signal that terminated the process (if any).
- @property {boolean} timedOut - Whether the command was terminated due to timeout.
- @property {number} duration - Execution time in milliseconds.
  \*/

/\*\*

- Runs a single shell command using spawn with timeout and output capturing.
- @param {CheckConfig} check - The check configuration object.
- @param {number} defaultTimeout - The default timeout from global config.
- @returns {Promise<CommandResult>} - Result of the command execution.
  \*/
  export function runCommand(check, defaultTimeout) {
  return new Promise((resolve) => {
  const startTime = Date.now();
  const timeoutMs = check.timeout ?? defaultTimeout;
  let output = '';
  let timedOut = false;
  let timer;

      // Determine shell and command arguments based on OS
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd' : '/bin/sh';
      const args = isWindows ? ['/c', check.command] : ['-c', check.command];

      const child = spawn(shell, args, {
        stdio: ['ignore', 'pipe', 'pipe'], // ignore stdin, pipe stdout/stderr
        encoding: 'utf8',
        windowsHide: true, // Hide console window on Windows
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString(); // Combine stdout and stderr for analysis
      });

      // Timeout handler
      timer = setTimeout(() => {
        timedOut = true;
        console.warn(chalk.yellow(`⏳ Process for "${check.name}" exceeded timeout of ${timeoutMs / 1000}s. Terminating...`));
        // Send SIGTERM first, then SIGKILL if it doesn't terminate quickly
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 2000); // Give 2 seconds grace period before SIGKILL
      }, timeoutMs);

      let error = null; // Store potential spawn errors

      child.on('error', (err) => {
        error = err; // Capture errors like command not found (ENOENT)
        output += `\nSpawn Error: ${err.message}`;
        clearTimeout(timer); // Clear timeout if spawn fails early
        // No need to resolve here, 'close' event will still fire
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer); // Ensure timeout is cleared
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Determine success: exit code 0 AND no spawn error occurred
        const success = code === 0 && error === null;

        resolve({
          success,
          output: output.trim(),
          exitCode: code,
          signal: signal,
          timedOut: timedOut || signal === 'SIGTERM' || signal === 'SIGKILL', // Mark as timedOut if killed by timer or signals
          duration,
        });
      });

  });
  }

6. reporting/reporter.js

javascript
// reporting/reporter.js
import chalk from 'chalk';
import { categorizeError } from '../utils/errorCategorizer.js';

const MAX_SUMMARY_OUTPUT_LENGTH = 1000; // Limit output length in summary

/\*\*

- @typedef {import('../config/schema.js').Config} Config
- @typedef {import('../runner/commandRunner.js').CommandResult} CommandResult
- @typedef {import('../config/schema.js').Config['checks'][0]} CheckConfig
  \*/

/\*\*

- @typedef {object} FailedCheckDetails
- @property {CheckConfig} check - The configuration of the failed check.
- @property {CommandResult} result - The execution result.
- @property {string} [category] - Matched error category name.
- @property {string} [suggestion] - Suggestion for the matched category.
  \*/

export class Reporter {
/** @param {Config} config \*/
constructor(config) {
/** @private _/
this.config = config;
/\*\* @private @type {FailedCheckDetails[]} _/
this.failedChecks = [];
/** @private \*/
this.startTime = 0;
/** @private _/
this.checksCompleted = 0;
/\*\* @private _/
this.totalChecks = config.checks.length;
}

startRun() {
this.startTime = Date.now();
console.log(chalk.cyan.bold('\n--- Starting Code Quality Checks ---'));
const mode = this.config.runInParallel ? 'parallel' : 'sequential';
const modeIcon = this.config.runInParallel ? '⚡' : '→';
console.log(chalk.cyan(`${modeIcon} Running ${this.totalChecks} checks in ${mode} mode...\n`));
}

/\*\*

- @param {CheckConfig} check
- @param {number} index - The 0-based index of the check being run.
  \*/
  startCommand(check, index) {
  const progress = this.config.runInParallel ? '' : `[${index + 1}/${this.totalChecks}] `;
  // Use simpler symbols for better terminal compatibility
  console.log(chalk.blue(`${progress}▶ Running: ${chalk.bold(check.name)} (${chalk.gray(check.command)})`));
  }

/\*\*

- @param {CheckConfig} check
- @param {CommandResult} result
  \*/
  commandSuccess(check, result) {
  this.checksCompleted++;
  const durationSec = (result.duration / 1000).toFixed(2);
  console.log(
  chalk.green(`✔ Success: ${chalk.bold(check.name)}`) + chalk.gray(` (${durationSec}s)\n`)
  );
  }

/\*\*

- @param {CheckConfig} check
- @param {CommandResult} result
  \*/
  commandFailure(check, result) {
  this.checksCompleted++;
  const durationSec = (result.duration / 1000).toFixed(2);
  const failureMsg = result.timedOut
  ? `Timeout after ${check.timeout ?? this.config.commandTimeout / 1000}s`
  : `Failed (Exit Code: ${result.exitCode ?? 'N/A'}${result.signal ? `, Signal: ${result.signal}` : ''})`;


    console.error(
      chalk.red(`✘ ${failureMsg}: ${chalk.bold(check.name)}`) + chalk.gray(` (${durationSec}s)\n`)
    );

    // Show immediate snippet of the error
    const errorSnippet = (result.output || 'No output captured.').substring(0, 300);
    console.error(
      chalk.gray(`  Error snippet: ${errorSnippet}${errorSnippet.length === 300 ? '...' : ''}\n`)
    );

    const { category, suggestion } = categorizeError(result.output, this.config.errorCategories);
    this.failedChecks.push({ check, result, category, suggestion });

}

/\*\*

- @param {CheckConfig} check - The check that failed causing the stop.
  \*/
  showStopOnFailMessage(check) {
  console.log(
  chalk.yellow(
  `\n⚠️ Stopping sequential run due to failure on '${check.name}' (stopOnFail=true).\n`
  )
  );
  }

/\*\*

- @returns {boolean} - True if all checks passed, false otherwise.
  \*/
  finalize() {
  const endTime = Date.now();
  const totalDuration = ((endTime - this.startTime) / 1000).toFixed(2);
  const allPassed = this.failedChecks.length === 0;
  const resultMessage = allPassed
  ? chalk.green.bold('✔ All checks passed successfully!')
  : chalk.red.bold(`✘ ${this.failedChecks.length} check(s) failed.`);


    console.log(chalk.cyan.bold(`\n--- Code Quality Checks Complete ---`));
    console.log(`Ran ${this.checksCompleted}/${this.totalChecks} checks in ${totalDuration}s.`);
    console.log(`${resultMessage}\n`);

    if (!allPassed) {
      this.printFailureSummary();
    }

    return allPassed;

}

/\*_ @private _/
printFailureSummary() {
console.error(chalk.yellow.bold('--- Failure Analysis Summary ---'));

    const categorizedFailures = {};
    const uncategorizedFailures = [];

    this.failedChecks.forEach(failure => {
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
    const printFailure = (/** @type {FailedCheckDetails} */ failure) => {
      const reason = failure.result.timedOut ? chalk.magenta('(Timed Out)') : '';
      console.error(chalk.red(`\n▼ Check: ${chalk.bold(failure.check.name)} (${failure.check.command}) ${reason}`));
      const outputToShow = failure.result.output.substring(0, MAX_SUMMARY_OUTPUT_LENGTH);
      console.error(chalk.white(outputToShow));
      if (failure.result.output.length > MAX_SUMMARY_OUTPUT_LENGTH) {
        console.error(
          chalk.gray(`\n[... Output truncated in summary. Scroll up for full output from the command execution. ...]\n`)
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

}
} 7. scripts/code-quality.js (Main Orchestrator)

javascript
#!/usr/bin/env node
// scripts/code-quality.js
import chalk from 'chalk';
import { loadConfig } from '../config/loader.js';
import { runCommand } from '../runner/commandRunner.js';
import { Reporter } from '../reporting/reporter.js';

/\*\*

- Main execution function.
  \*/
  async function main() {
  let config;
  try {
  config = await loadConfig();
  } catch (error) {
  console.error(chalk.red.bold(`\n❌ Failed to initialize: ${error.message}`));
  process.exit(1);
  }

const reporter = new Reporter(config);
reporter.startRun();

const { checks, runInParallel, stopOnFail, commandTimeout } = config;

const commandPromises = []; // Used for parallel execution

if (runInParallel) {
// --- Parallel Execution ---
checks.forEach((check, index) => {
reporter.startCommand(check, index); // Log start immediately
const promise = runCommand(check, commandTimeout)
.then(result => ({ check, result })) // Pass check config along with result
.catch(error => ({ // Catch unexpected errors during runCommand itself
check,
result: {
success: false,
output: `Internal error running command: ${error.message}\n${error.stack}`,
exitCode: null,
signal: null,
timedOut: false,
duration: 0 // Or measure duration until error
}
}));
commandPromises.push(promise);
});

    const results = await Promise.all(commandPromises);

    // Process results after all parallel commands finished
    results.forEach(({ check, result }) => {
      if (result.success) {
        reporter.commandSuccess(check, result);
      } else {
        reporter.commandFailure(check, result);
      }
    });

} else {
// --- Sequential Execution ---
for (let i = 0; i < checks.length; i++) {
const check = checks[i];
reporter.startCommand(check, i);
let result;
try {
result = await runCommand(check, commandTimeout);
} catch(error) {
// Handle unexpected errors during runCommand itself
result = {
success: false,
output: `Internal error running command: ${error.message}\n${error.stack}`,
exitCode: null,
signal: null,
timedOut: false,
duration: 0 // Or measure duration until error
};
}

      if (result.success) {
        reporter.commandSuccess(check, result);
      } else {
        reporter.commandFailure(check, result);
        if (stopOnFail) {
          reporter.showStopOnFailMessage(check);
          break; // Stop processing further commands
        }
      }
    }

}

// --- Finalize and Exit ---
const allPassed = reporter.finalize();
process.exit(allPassed ? 0 : 1);
}

// Run the main function and catch top-level errors
main().catch(error => {
console.error(chalk.red.bold('\n\n🚨 An unexpected critical error occurred:'));
console.error(error);
process.exit(2); // Use a different exit code for framework errors
}); 8. .code-quality.json (Example Configuration)

json
{
"$schema": "./config/schema.js", // Optional: For editor hints if supported
"runInParallel": false,
"stopOnFail": true,
"commandTimeout": 300000, // 5 minutes global default
"checks": [
{
"id": "format-check",
"name": "Check Formatting (Prettier)",
"command": "npm run format:check"
},
{
"id": "lint",
"name": "Linting (ESLint)",
"command": "npm run lint",
"timeout": 120000 // 2 minutes specific timeout for linting
},
{
"id": "typecheck",
"name": "Type Checking (TSC)",
"command": "npx tsc --noEmit --project tsconfig.json"
},
{
"id": "build",
"name": "Build Project",
"command": "npm run build"
},
{
"id": "test-unit",
"name": "Unit Tests (Jest)",
"command": "npm run test:unit -- --ci --silent"
}
],
"errorCategories": {
"Formatting Issues": {
"patterns": [
"Code style issues found",
"Run prettier to fix"
],
"suggestion": "Run 'npm run format' to automatically fix formatting."
},
"TypeScript Errors": {
"patterns": [
"error TS\\d+:",
"Type check failed"
],
"suggestion": "Review the TypeScript errors listed above and fix type definitions or logic."
},
"Linting Errors": {
"patterns": [
"eslint",
"problems \\(\\d+ errors?, \\d+ warnings?\\)"
],
"suggestion": "Run 'npm run lint -- --fix' to attempt automatic fixes, or manually address the reported linting issues."
},
"Test Failures": {
"patterns": [
"Test suite failed to run",
"FAIL\\s+",
"Tests:\\s+\\d+ failed"
],
"suggestion": "Review the failing test output, fix the test logic or the code under test."
}
}
}
Summary of Changes and Why It's More "Enterprise-Grade":

Modularity & Separation of Concerns: Code is broken into logical units (config, runner, reporting, utils). This improves readability, makes it easier to locate specific logic, enhances maintainability (changes in one area are less likely to break others), and crucially, makes the code testable. Enterprise software requires testing.
Robust Configuration: Using zod for schema definition and validation ensures that the .code-quality.json file adheres to the expected structure and types before the script tries to use it. This prevents runtime errors due to typos or incorrect config values and provides clear error messages if the config is invalid. The schema itself is more explicit (e.g., checks as an array of objects with id, name, command).
Improved Process Handling (spawn vs. exec): spawn is better suited for potentially long-running tasks or commands that produce significant output. It handles I/O via streams, avoiding the buffer limits of exec which can cause crashes. It also offers finer control over the child process (e.g., sending specific signals like SIGTERM before SIGKILL for graceful shutdown during timeouts).
Dedicated Reporter: Centralizing all console.log/chalk calls into a Reporter class ensures consistent output formatting. It decouples the logic of running checks from the presentation of results. This makes it easier to change the output style globally or even add different reporters (e.g., a JSON reporter for CI systems) without modifying the core execution logic.
Clearer State & Results: The runCommand function now returns a structured CommandResult object containing detailed information (success status, output, exit code, signal, timeout status, duration). This makes the main orchestration logic cleaner as it deals with predictable result objects.
Enhanced Error Handling: Specific try...catch blocks are used for config loading/validation and for the execution of each command. The main script also has a top-level catch for unexpected framework errors. Errors during spawn itself (like command not found) are now handled more gracefully.
Improved Readability & Maintainability: Using classes (like Reporter), clear function signatures (aided by JSDoc), and consistent structure makes the codebase easier for developers to understand, debug, and extend over time.
Extensibility: The structure (e.g., checks array, Reporter class) makes it easier to add new features in the future, such as different types of checks (e.g., running JS functions directly), custom reporters, or more sophisticated retry logic.
This refactored version provides a much stronger foundation, addressing reliability, maintainability, and flexibility – key characteristics of enterprise-grade tooling
