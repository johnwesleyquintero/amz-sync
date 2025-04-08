# Code Quality Framework

## Overview

The Code Quality Framework automates and enforces code quality checks within your project. It ensures adherence to formatting standards, linting rules, type safety, and successful builds. Integrated into your CI pipeline, it maintains high code quality standards consistently.

## Dependencies

To use this Code Quality Framework script (`scripts/code-quality.js`) in your project, you need the following dependencies installed:

1. **`chalk`**: Used by the script for colorful console output to improve readability.
2. **Project-Specific Tools**: The framework calls standard npm scripts (`format`, `lint`, `typecheck`, `build`). Your project must define these scripts in its `package.json` and have the corresponding tools installed. Common examples include:
   - **Formatter**: `prettier` (for `npm run format`)
   - **Linter**: `eslint` (for `npm run lint`)
   - **Type Checker**: `typescript` (for `npm run typecheck`)
   - **Build Tool**: `typescript` (tsc), `vite`, `webpack`, etc. (for `npm run build`)

### Installation

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

1. **Create the Script**: Place the `code-quality.js` script (provided below) into a `scripts` directory in your project root.
2. **Configure `package.json`**: Add the `cq` and `ci` scripts to your `package.json`. Ensure the `format`, `lint`, `typecheck`, and `build` scripts are also defined and correctly configured for your project's tools.
3. **Run**: Execute the checks using your package manager.

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
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx", // Example using ESLint
    "typecheck": "tsc --noEmit", // Example using TypeScript compiler
    "build": "tsc", // Example using TypeScript compiler (adjust for your build tool)

    // Framework scripts
    "ci": "npm run format && npm run lint && npm run typecheck && npm run build", // Runs all checks sequentially for CI
    "cq": "node scripts/code-quality.js" // Executes the code quality script runner
  }
}
```

(Note: Adapt the `format`, `lint`, `typecheck`, and `build` scripts based on the actual tools and configurations used in your project.)

### `scripts/code-quality.js`

Create a `code-quality.js` file in the `scripts` directory with the following content:

```javascript
// scripts/code-quality.js
import chalk from 'chalk';
import { execSync } from 'child_process';

// Define the sequence of commands based on your package.json scripts
const commands = [
  { name: 'format', script: 'npm run format' }, // Formats the code
  { name: 'lint', script: 'npm run lint' }, // Lints the code
  { name: 'typecheck', script: 'npm run typecheck' }, // Checks types
  { name: 'build', script: 'npm run build' }, // Builds the project
];

(async () => {
  console.log(chalk.blue('𝒘𝒆𝒔𝒄𝒐𝒅𝒆‌ | ᯓ➤ 𝚂𝚝𝚊𝚛𝚝𝚒𝚗𝚐 𝚌𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔𝚜...\n'));
  const startTime = Date.now();

  try {
    for (const { name, script } of commands) {
      const stepStartTime = Date.now();
      console.log(chalk.yellow(`▶ Running: ${name} (${script})`));
      // Execute the command, inherit stdio to see output/errors in real-time
      execSync(script, { stdio: 'inherit' });
      const stepEndTime = Date.now();
      console.log(
        chalk.gray(`  Completed ${name} in ${((stepEndTime - stepStartTime) / 1000).toFixed(2)}s`)
      );
    }

    const endTime = Date.now();
    console.log(
      chalk.green(
        `\n✔ All code quality checks passed successfully in ${((endTime - startTime) / 1000).toFixed(2)}s!`
      )
    );
    process.exit(0); // Exit with success code
  } catch (error) {
    // execSync throws an error if the command fails (exits non-zero)
    console.error(chalk.red('\n✘ Code quality check failed.'));
    // No need to log error.message as execSync with stdio: 'inherit' already showed the tool's error output.
    const endTime = Date.now();
    console.error(chalk.red(`  Total time elapsed: ${((endTime - startTime) / 1000).toFixed(2)}s`));
    process.exit(1); // Exit with failure code
  }
})();
```

## Explanation

- **Chalk**: Used for colorful console output to enhance readability.
- **execSync**: Executes each command synchronously, ensuring that the next command runs only if the previous one succeeds. `stdio: 'inherit'` ensures the output (and errors) of the underlying tools are displayed directly in the console.
- **Commands Array**: Defines the sequence of checks to run. These correspond to the scripts defined in your `package.json`.
- **Error Handling**: If any command fails (exits with a non-zero code), `execSync` throws an error, the script catches it, logs a failure message, and exits with code 1, signaling failure to CI environments.

## Integration with CI

The `ci` script in `package.json` can be used directly in your Continuous Integration (CI) pipeline (e.g., GitHub Actions, GitLab CI) to automate code quality checks on every commit or pull request. Alternatively, you can run `npm run cq` in your CI pipeline. Using `npm run cq` provides slightly better output formatting thanks to the script.

### Example CI step (using npm):

```yaml
- name: Run Code Quality Checks
  run: npm run cq
```

---

### Additional Notes

- **Error Handling**: The script provides clear error messages, which are crucial for debugging.
- **CI Integration**: Emphasize the importance of integrating these checks into the CI pipeline to catch issues early.

This documentation should help developers understand the purpose and implementation of the Code Quality Framework effectively.
