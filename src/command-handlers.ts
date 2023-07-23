import { getLogger } from './logger.js';
import { SecondBrainPublishedConfig } from './config.js';
import { Note } from 'types';
import FormData from 'form-data';
import { Dirent, existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { parse, withMetaInfo } from 'org-mode-ast';
import { join, resolve } from 'path';
import axios from 'axios';

export const isOrgFile = (fileName: string): boolean => /\.org$/.test(fileName);

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
const extractFilenameFromPath = (path: string): string =>
  path.split('/').pop() as string;

const readFiles = (
  filePaths: string[]
): Array<{ blob: Buffer; fileName: string }> => {
  const files = filePaths.reduce((files, filePath) => {
    if (existsSync(filePath)) {
      return [
        ...files,
        {
          blob: readFileSync(filePath),
          fileName: extractFilenameFromPath(filePath),
        },
      ];
    }
    return files;
  }, []);
  return files;
};

function getRelativeNotePath(rootFolder: string, filePath: string): string[] {
  if (!filePath.startsWith(rootFolder)) {
    return [];
  }
  const fullRelativePath = filePath.slice(rootFolder.length).split('/');
  return fullRelativePath.slice(1);
}

function syncNote(
  filePath: string,
  config: SecondBrainPublishedConfig
): Note[] {
  // middleware here
  const relativeNotePath = getRelativeNotePath(config.rootFolder, filePath);
  const fileContent = readFileSync(filePath, 'utf8');
  const parsedDoc = parse(fileContent);
  const nodeTree = withMetaInfo(parsedDoc);
  const note: Note = {
    id: nodeTree.meta.id,
    meta: nodeTree.meta,
    content: fileContent,
    filePath: relativeNotePath,
  };

  if (!note.id) {
    throw 'File is not a org roam file. Specify id in org PROPERTY keyword and make sure that file is *.org';
  }
  return [note];
}
function syncNotes(
  dirPath: string,
  config: SecondBrainPublishedConfig
): Note[] {
  logger.info('dir path: %o', dirPath);
  const files = readdirSync(dirPath, { withFileTypes: true });
  logger.info(
    `✎: [index.ts][${new Date().toString()}] file length %o`,
    files.length
  );
  const notes = files.reduce((notes: Note[], dirent: Dirent) => {
    logger.info(
      `✎: [index.ts][${new Date().toString()}] dirent %o`,
      dirent.name
    );
    const isDir = dirent.isDirectory();
    const fileName = resolve(dirPath, dirent.name);

    if (isDir) {
      return [...notes, ...syncNotes(fileName, config)];
    }

    if (!isOrgFile(fileName)) {
      return notes;
    }

    const collectedNote = syncNote(fileName, config);
    if (collectedNote) {
      return [...notes, ...collectedNote];
    }

    return notes;
  }, []);

  return notes;
}

async function publishNotes(
  path: string,
  config: SecondBrainPublishedConfig
): Promise<void> {
  const stats = statSync(path);
  const collectNoteFn = stats.isDirectory() ? syncNotes : syncNote;
  logger.info(
    `✎: [index.ts][${new Date().toString()}] is notes directory: %o`,
    stats.isDirectory()
  );
  logger.info(`✎: [index.ts][${new Date().toString()}] path: %o`, path);
  const notes = collectNoteFn(path, config);
  if (!notes.length) {
    return;
  }
  logger.info(
    `✎: [index.ts][${new Date().toString()}] Collected notes length: %o`,
    notes.length
  );
  await sendNotes(notes, config, path);
}

const sendNotes = async (
  notes: Note[],
  config: SecondBrainPublishedConfig,
  dirPath: string
) => {
  logger.info('notes to send: %o', notes ?? []);

  const files = readFiles(
    notes
      .flatMap((note) => note.meta.images?.map((img) => join(dirPath, img)))
      .filter((i) => !!i)
  );

  const formData = new FormData();
  notes.forEach((note) => formData.append('notes', JSON.stringify(note)));

  files.forEach((f) => {
    formData.append('files', f.blob, {
      filename: f.fileName,
      contentType: 'file',
      header: {
        Authorization: `Bearer ${config.token}`,
      },
    });
  });

  try {
    const rspns = await axios({
      url: `${config.remoteAddress}/${config.version}/notes/bulk-upsert`,
      method: 'put',
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${config.token}`,
      },
      data: formData,
    });
  } catch (e) {
    // TODO: master catch only http errors
    // console.error(JSON.stringify(e, null, 2));
    logger.error(`🦄: [http error] error while send http request:
    | status: ${e.response?.status ?? ''}
    | data: ${e.response?.data ? JSON.stringify(e.response.data) : ''}
    | message: ${e.message ?? ''}
`);

    process.exit(1);
  }
};

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
