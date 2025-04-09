# Code Quality Framework

## Overview

The Code Quality Framework automates code quality checks within your project, ensuring adherence to formatting standards, linting rules, type safety, and successful builds. **Crucially, it runs all configured checks sequentially, even if some produce errors or warnings, and provides a consolidated summary of any issues encountered at the end.** This facilitates easier debugging and ensures all potential problems are highlighted in a single run. When integrated into your CI pipeline, it consistently maintains high code quality standards.

## Dependencies

To use the Code Quality Framework script (`scripts/code-quality.js`) in your project, you need the following dependencies installed:

1.  **`chalk`**: Used by the script for colorful console output to improve readability.
2.  **Project-Specific Tools**: The framework calls standard npm scripts (`format`, `lint`, `typecheck`, `build`). Your project must define these scripts in its `package.json` and have the corresponding tools installed.

    Common examples include:

    - **Formatter**: `prettier` (for `npm run format`)
    - **Linter**: `eslint` (for `npm run lint`)
    - **Type Checker**: `typescript` (for `npm run typecheck` or similar)
    - **Build Tool**: `vite`, `webpack`, `typescript` (`tsc`), etc. (for `npm run build`)

## Installation

Install `chalk` as a development dependency:

```bash
npm install --save-dev chalk
# or
yarn add --dev chalk
# or
pnpm add --save-dev chalk
# or
bun add --dev chalk
```

Ensure you also have your chosen formatter, linter, type checker, and build tool installed as development dependencies according to your project's needs. For example:

```bash
npm install --save-dev prettier eslint typescript
# or
yarn add --dev prettier eslint typescript
# etc.
```

## Usage

1.  **Create the Script**: Place the `code-quality.js` script (provided below) into a `scripts` directory in your project root.
2.  **Configure `package.json`**: Add the `cq` script to your `package.json`. Ensure the `format`, `lint`, `typecheck`, and `build` scripts (or similar names used by the `code-quality.js` script) are also defined and correctly configured for your project's tools.
3.  **Run**: Execute the checks using your package manager.

```shell
npm run cq
# or
yarn cq
# or
pnpm cq
# or
bun cq
```

## Configuration

### `package.json`

Add or ensure the following scripts exist in your `package.json` file:

```json
{
  "scripts": {
    // Your project's specific scripts called by the framework
    "format": "prettier --write .", // Example using Prettier
    "lint": "eslint . --max-warnings=0", // Example using ESLint. Using --max-warnings=0 ensures lint warnings cause a failure, triggering inclusion in the error summary.
    "typecheck": "tsc --noEmit", // Example using TypeScript compiler
    "build": "vite build", // Example using Vite (adjust for your build tool)

    // Framework script runner
    "cq": "node scripts/code-quality.js" // Executes the enhanced code quality script
  }
}
```

(Note: Adapt the `format`, `lint`, `typecheck`, and `build` scripts based on the actual tools and configurations used in your project. Ensure the script names match those used in the `commands` array within `code-quality.js`.)

### `scripts/code-quality.js`

Create or update the `code-quality.js` file in the `scripts` directory with the following content:

```javascript
// scripts/code-quality.js
import chalk from 'chalk';
import { execSync } from 'child_process';

// Define the sequence of commands based on your package.json scripts
const commands = [
  'npm run format',
  'npm run lint',
  'npx tsc --noEmit', // Or your typecheck script e.g., 'npm run typecheck'
  'npm run build',
];

// Array to keep track of commands that failed and their output
const failedCommandDetails = []; // Will store objects like { cmd: string, errorOutput: string }

(async () => {
  console.log(chalk.blue('𝒘𝒆𝒔𝚌𝚘𝚍𝚎‌ | ᯓ➤ 𝚂𝚝𝚊𝚛𝚝𝚒𝚗𝚐 𝚌𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔𝚜...\n'));
  let allPassed = true; // Assume success initially
  const startTime = Date.now();

  for (const cmd of commands) {
    const stepStartTime = Date.now();
    console.log(chalk.yellow(`▶ 𝚁𝚞𝚗𝚗𝚒𝚗𝚐: ${cmd}`));
    try {
      // Execute the command, inherit stdio to see output/errors immediately
      // Add encoding to ensure stderr/stdout on error are strings
      execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
      // If execSync doesn't throw, the command succeeded
      const stepEndTime = Date.now();
      console.log(
        chalk.green(`✔ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜: ${cmd}`) +
          chalk.gray(` (${((stepEndTime - stepStartTime) / 1000).toFixed(2)}s)\n`)
      );
    } catch (error) {
      // If execSync throws, the command failed
      const stepEndTime = Date.now();
      console.error(
        chalk.red(`✘ 𝙵𝚊𝚒𝚕𝚎𝚍: ${cmd}`) +
          chalk.gray(` (${((stepEndTime - stepStartTime) / 1000).toFixed(2)}s)\n`)
      );
      allPassed = false; // Mark that at least one check failed

      // --- Capture Error Output ---
      const errorOutput = (error.stderr || '') + (error.stdout || ''); // Combine both streams

      failedCommandDetails.push({
        cmd: cmd,
        // Store the captured output, fallback to error message if streams were empty
        errorOutput: errorOutput.trim() || error.message,
      });
    }
  }

  // --- Summary Section ---
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(chalk.blue(`𝒘𝒆𝒔𝚌𝚘𝚍𝚎‌ | ᯓ➤ 𝙲𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔𝚜 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚎 in ${totalDuration}s.\n`));

  if (allPassed) {
    console.log(chalk.green(`✔ 𝙰𝚕𝚕 𝚌𝚑𝚎𝚌𝚔𝚜 𝚙𝚊𝚜𝚜𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢!`));
    process.exit(0); // Exit with success code
  } else {
    console.error(chalk.red('✘ 𝚂𝚘𝚖𝚎 𝚌𝚑𝚎𝚌𝚔𝚜 𝚏𝚊𝚒𝚕𝚎𝚍. 𝙴𝚛𝚛𝚘𝚛 𝙰𝚗𝚊𝚕𝚢𝚜𝚒𝚜 𝚂𝚞𝚖𝚖𝚊𝚛𝚢:'));
    console.error(chalk.yellow('--------------------------------------------------'));

    failedCommandDetails.forEach(failure => {
      console.error(chalk.red(`\n▼▼▼ Errors/Output from: ${chalk.bold(failure.cmd)} ▼▼▼`));
      // Print the captured output from the failed command
      console.error(chalk.white(failure.errorOutput));
      console.error(chalk.yellow('▲▲▲ End of output ▲▲▲'));
    });

    console.error(chalk.yellow('\n--------------------------------------------------'));
    console.error(
      chalk.yellow(
        '\nPlease review the summarized errors above. You may need to scroll up to see the full context from the original execution.'
      )
    );
    process.exit(1); // Exit with failure code
  }
})();
```

## Explanation

- **Chalk**: Used for colorful console output to enhance readability.
- **execSync**: Executes each command synchronously. `stdio: 'inherit'` ensures the output (and errors) of the underlying tools are displayed directly in the console in real-time. `encoding: 'utf8'` helps ensure error output can be captured as strings.
- **Commands Array**: Defines the sequence of checks to run. These correspond to the scripts defined in your `package.json`.
- **Run All & Capture Errors**: The script loops through each command. A `try...catch` block wraps the execution of each command.
  - If a command succeeds, a success message is printed.
  - If a command fails (exits with a non-zero code), `execSync` throws an error. The `catch` block executes:
    - A failure message is printed.
    - The script attempts to capture the `stderr` and `stdout` from the failed command's error object.
    - The command name and its captured output are stored in the `failedCommandDetails` array.
  - The script continues to the next command in the sequence.
- **Error Summary**: After all commands have been attempted, the script checks if any failures were recorded.
  - If all commands passed, a final success message is shown, and the script exits with code 0.
  - If any command failed, a summary section is printed:
    - It clearly indicates that checks failed.
    - It iterates through the `failedCommandDetails` array.
    - For each failure, it prints a header with the failed command's name and then displays the captured error/warning output from that command.
  - The script exits with code 1, signaling failure to CI environments or other tools.

## Integration with CI

Using `npm run cq` (or `yarn cq`, `pnpm cq`, `bun cq`) in your Continuous Integration (CI) pipeline (e.g., GitHub Actions, GitLab CI) is highly recommended. It automates the code quality checks on every commit or pull request and provides the valuable error summary output directly in the CI logs, making it easier to identify and fix issues quickly.

Example CI step (using npm):

```yaml
- name: Run Code Quality Checks
  run: npm run cq
```

## Additional Notes

- **Error Summary Benefit**: The final summary provides a focused view of only the outputs from failed steps, significantly speeding up the process of identifying and addressing errors or warnings.
- **Configuring Failure**: To ensure tools like linters contribute to the error summary even for warnings, configure them to exit with a non-zero code when warnings are present (e.g., `eslint --max-warnings=0`).
