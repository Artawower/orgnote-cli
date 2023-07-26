import { getLogger } from '../logger.js';
import { SecondBrainPublishedConfig } from '../config.js';
import axios from 'axios';
import { publishNotes } from './publish-notes.js';

const logger = getLogger();

export enum CliCommand {
  Collect = 'collect',
  Publish = 'publish',
  PublishAll = 'publish-all',
  // Sync = "sync",
}

type CommandHandlerFn = (
  arg0: SecondBrainPublishedConfig,
  path?: string
) => Promise<void>;

const commands: {
  [key in CliCommand]?: (
    arg0: SecondBrainPublishedConfig,
    path?: string
  ) => Promise<void>;
} = {};

// TMP FUNCS

async function loadNotes(config: SecondBrainPublishedConfig) {
  try {
    const rspns = await axios({
      method: 'get',
      url: `${config.remoteAddress}/${config.version}/notes`,
    });
    return rspns.data;
  } catch (e) {
    logger.error(e.response);
  }
}

const registerCommand = (command: CliCommand, handler: CommandHandlerFn) => {
  commands[command] = handler;
};

registerCommand(CliCommand.Publish, async (config, path): Promise<void> => {
  await publishNotes(path, config);
});

registerCommand(CliCommand.Collect, async (config): Promise<void> => {
  await loadNotes(config);
});

registerCommand(CliCommand.PublishAll, async (config): Promise<void> => {
  const path = config.rootFolder;
  await publishNotes(path, config);
});

export async function handleCommand(
  command: CliCommand,
  config: SecondBrainPublishedConfig,
  path: string
) {
  const commandExecutor = commands[command];
  if (!commandExecutor) {
    throw `Command ${command} is not supported`;
  }

  return await commandExecutor(config, path);
}