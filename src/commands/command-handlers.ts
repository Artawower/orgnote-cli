import { OrgNotePublishedConfig } from '../config.js';
import { publishNotes } from './publish-notes.js';
import { loadNotes } from './load-notes.js';
import { syncNotes } from './sync-notes.js';

export enum CliCommand {
  Load = 'load',
  Publish = 'publish',
  PublishAll = 'publish-all',
  Sync = 'sync',
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

registerCommand(CliCommand.Load, async (config): Promise<void> => {
  await loadNotes(config);
});

registerCommand(CliCommand.PublishAll, async (config): Promise<void> => {
  await publishNotes(config);
});

registerCommand(CliCommand.Sync, async (config): Promise<void> => {
  await syncNotes(config);
});

export async function handleCommand(
  command: CliCommand,
  config: OrgNotePublishedConfig,
  path: string
) {
  const commandExecutor = commands[command];
  if (!commandExecutor) {
    throw `Command ${command} is not supported`;
  }

  return await commandExecutor(config, path);
}
