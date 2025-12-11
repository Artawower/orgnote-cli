import { OrgNotePublishedConfig } from '../config.js';
import { backupDirectory } from '../backup.js';
import { validateConfig } from './validate-config.js';

export enum CliCommand {
  Sync = 'sync',
  ValidateConfig = 'validate-config',
}

type CommandHandlerFn = (
  config: OrgNotePublishedConfig | null,
  path?: string
) => Promise<void>;

const commands: Record<string, CommandHandlerFn> = {};

const registerCommand = (command: CliCommand, handler: CommandHandlerFn) => {
  commands[command] = handler;
};

registerCommand(CliCommand.Sync, async (): Promise<void> => {
  throw new Error('Sync command not implemented yet');
});

registerCommand(CliCommand.ValidateConfig, async (): Promise<void> => {
  await validateConfig();
});

export async function handleCommand(
  command: CliCommand,
  config: OrgNotePublishedConfig | null,
  path: string
) {
  const commandExecutor = commands[command];
  if (!commandExecutor) {
    throw command
      ? `Command ${command} is not supported`
      : 'No command provided, use --help option to check available commands';
  }

  if (command === CliCommand.ValidateConfig) {
    return await commandExecutor(config, path);
  }

  if (!config) {
    throw new Error('Config is required for this command');
  }

  await backupDirectory(config.rootFolder, config.backupDir);
  return await commandExecutor(config, path);
}
