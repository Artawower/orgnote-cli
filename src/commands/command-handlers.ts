import { OrgNotePublishedConfig } from '../config.js';
import { publishNotes } from './publish-notes.js';
import { loadNotes } from './load-notes.js';
import { syncNotes } from './sync-notes.js';
import { repairEncryptedNotes } from './repair-encrypted-notes.js';
import { backupDirectory } from '../backup.js';

export enum CliCommand {
  Load = 'load',
  Publish = 'publish',
  PublishAll = 'publish-all',
  Sync = 'sync',
  RepairEncryptedNotes = 'repair',
}

type CommandHandlerFn = (
  arg0: OrgNotePublishedConfig,
  path?: string
) => Promise<void>;

const commands: {
  [key in CliCommand]?: (
    arg0: OrgNotePublishedConfig,
    path?: string
  ) => Promise<void>;
} = {};

// TMP FUNCS

const registerCommand = (command: CliCommand, handler: CommandHandlerFn) => {
  commands[command] = handler;
};

registerCommand(CliCommand.Publish, async (config, path): Promise<void> => {
  await publishNotes(config, path);
});

registerCommand(CliCommand.Load, loadNotes);

registerCommand(CliCommand.PublishAll, publishNotes);

registerCommand(CliCommand.Sync, syncNotes);

registerCommand(CliCommand.RepairEncryptedNotes, repairEncryptedNotes);

export async function handleCommand(
  command: CliCommand,
  config: OrgNotePublishedConfig,
  path: string
) {
  const commandExecutor = commands[command];
  if (!commandExecutor) {
    throw `Command ${command} is not supported`;
  }

  await backupDirectory(config.rootFolder, config.backupDir);
  return await commandExecutor(config, path);
}
