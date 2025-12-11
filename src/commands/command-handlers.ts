import { OrgNotePublishedConfig } from '../config.js';
import { backupDirectory } from '../backup.js';

export enum CliCommand {
  Sync = 'sync',
}

type CommandHandlerFn = (
  config: OrgNotePublishedConfig,
  path?: string
) => Promise<void>;

const commands: Record<string, CommandHandlerFn> = {};

const registerCommand = (command: CliCommand, handler: CommandHandlerFn) => {
  commands[command] = handler;
};

registerCommand(CliCommand.Sync, async (): Promise<void> => {
  throw new Error('Sync command not implemented yet');
});

export async function handleCommand(
  command: CliCommand,
  config: OrgNotePublishedConfig,
  path: string
) {
  const commandExecutor = commands[command];
  if (!commandExecutor) {
    throw command
      ? `Command ${command} is not supported`
      : 'No command provided, use --help option to check available commands';
  }

  await backupDirectory(config.rootFolder, config.backupDir);
  return await commandExecutor(config, path);
}
