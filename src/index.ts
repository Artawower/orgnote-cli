#!/usr/bin/env node

import axios from 'axios';
import { Dirent, existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import FormData from 'form-data';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Note } from 'types';
import { parse, withMetaInfo } from 'org-mode-ast';
import { getLogger } from './logger.js';
import { getConfig, SecondBrainPublishedConfig } from './config.js';
import { format, transports } from 'winston';

const logger = getLogger();

export const isOrgFile = (fileName: string): boolean => /\.org$/.test(fileName);

const extractFilenameFromPath = (path: string): string =>
  path.split('/').pop() as string;

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

// TODO: master move connectors to external module
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

enum CliCommand {
  Collect = 'collect',
  Publish = 'publish',
  PublishAll = 'publish-all',
  // Sync = "sync",
}

const commands: {
  [key in CliCommand]: (
    arg0: SecondBrainPublishedConfig,
    path?: string
  ) => Promise<void>;
} = {
  [CliCommand.Publish]: async (
    config: SecondBrainPublishedConfig,
    path: string
  ) => {
    await publishNotes(path, config);
  },
  [CliCommand.Collect]: async (config: SecondBrainPublishedConfig) => {
    const collectedNotes = await loadNotes(config);
  },
  [CliCommand.PublishAll]: async (config: SecondBrainPublishedConfig) => {
    const path = config.rootFolder;
    await publishNotes(path, config);
  },
};

(async () => {
  const argv = yargs(hideBin(process.argv)).options({
    debug: {
      describe: 'Enable debug mode for verbose logging',
      type: 'boolean',
    },
  }).argv;
  const command = argv._[0] as CliCommand;
  const commandExecutor = commands[command];
  const accountName = argv.accountName as string;

  if (!commandExecutor) {
    throw `Command ${command} is not supported`;
  }

  const config = getConfig(accountName);

  config.remoteAddress = (argv.remoteAddress as string) || config.remoteAddress;
  config.token = (argv.token as string) || config.token;
  config.debug = (argv.debug as boolean) ?? config.debug;
  const path = (argv._[argv._.length - 1] as string) || config.rootFolder;

  if (config.debug) {
    logger.level = 'info';
    logger.add(
      new transports.Console({
        format: format.simple(),
      })
    );
  }

  logger.info('Current configuration: %o', config);

  logger.info('started with provided configs: %o', config);

  try {
      await commandExecutor(config, path);
  } catch (e) {
    logger.error(e);
  }
})();
