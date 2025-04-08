import chalk from 'chalk';
import { execSync } from 'child_process';

const commands = ['npm run format', 'npm run lint', 'npm run typecheck', 'npm run build'];

(async () => {
  try {
    console.log(chalk.blue('𝒘𝒆𝒔𝒄𝒐𝒅𝒆‌ | ᯓ➤ 𝚂𝚝𝚊𝚛𝚝𝚒𝚗𝚐 𝚌𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔𝚜...\n'));

    for (const cmd of commands) {
      console.log(chalk.yellow(`▶ 𝚁𝚞𝚗𝚗𝚒𝚗𝚐: ${cmd}`));
      execSync(cmd, { stdio: 'inherit' });
    }

    console.log(chalk.green('\n✔ 𝙰𝚕𝚕 𝚌𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔𝚜 𝚙𝚊𝚜𝚜𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢!'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n✘ 𝙲𝚘𝚍𝚎 𝚚𝚞𝚊𝚕𝚒𝚝𝚢 𝚌𝚑𝚎𝚌𝚔 𝚏𝚊𝚒𝚕𝚎𝚍:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
})();
