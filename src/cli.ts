import { Command } from '@commander-js/extra-typings';
import { version } from '../package.json';
import { CliCommand } from './commands/command-handlers';

export interface CliArguments {
  debug: boolean;
  rootFolder: string;
  force: boolean;
  accountName: string;
}

const commandDescriptionMan: { [key in CliCommand]: string } = {
  [CliCommand.Sync]: 'Synchronize files with remote server',
};

export function run(
  fn: (command: string, args: CliArguments) => Promise<void>
): Command {
  const program = new Command();
  program
    .name('orgnote-cli')
    .description('CLI tool for work with org-note remote server')
    .version(version);

  Object.entries(commandDescriptionMan).forEach(([command, description]) => {
    program
      .command(command)
      .option('-d, --debug', 'Debug mode for more logs (optional)')
      .option('-r, --rootFolder <string>', 'Root folder for notes (optional)')
      .option(
        '-f, --force',
        'Force operation, clear local cache before sync (optional)'
      )
      .option(
        '-a, --accountName <string>',
        'Account name stored in the config file (optional)'
      )
      .description(description)
      .action(async (args) => await fn(command, args as CliArguments));
  });

  program.showHelpAfterError();
  program.parse(process.argv);
  return program;
}
