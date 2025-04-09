// scripts/code-quality.js
import chalk from 'chalk';
import { execSync } from 'child_process';

// Define the sequence of commands based on your package.json scripts
const commands = [
  'npm run format',
  'npm run lint',
  'npx tsc --noEmit', // Or your typecheck script e.g., 'npm run typecheck'
];

// Array to keep track of commands that failed and their output
const failedCommandDetails = []; // Will store objects like { cmd: string, errorOutput: string }

(async () => {
  console.log(chalk.blue('𝒘𝒆𝒔𝒄𝒐𝒅𝒆‌ | ᯓ➤ 𝚂𝚝𝚊𝚛𝚝𝚒𝚗𝚐 𝚌𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝ｙ 𝚌𝚑𝚎𝚌𝚔𝚜...\n'));
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
