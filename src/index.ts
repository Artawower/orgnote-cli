#!/usr/bin/env node

import axios from "axios";
import { existsSync, readFileSync, statSync } from "fs";
import { dirname, join } from "path";
import {
  collectNoteFromFile,
  collectOrgNotesFromDir,
} from "second-brain-parser";
import {
  createLinkMiddleware,
  Note,
} from "second-brain-parser/dist/parser/index.js";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface SecondBrainPublishedConfig {
  remoteAddress: string;
  token: string;
  baseDir: string;
  version: string;
  name?: string;
}

const defaultUrl =
  process.env.SECOND_BRAIN_SERVER_URL || "http://localhost:8000";
// process.env.SECOND_BRAIN_SERVER_URL || "https://second-brain.org";

const configPath =
  process.env.SECOND_BRAIN_CONFIG_PATH ||
  `${os.homedir()}/.config/second-brain/config.json`;

const baseDir = process.env.SECOND_BRAIN_BASE_DIR || "";

const readConfig = (accountName?: string): SecondBrainPublishedConfig => {
  let defaultConfigs = {
    remoteAddress: defaultUrl,
    token: process.env.SECOND_BRAIN_TOKEN || "",
    baseDir,
    version: process.env.SECOND_BRAIN_VERSION || "v1",
  };

  try {
    const configs = JSON.parse(
      readFileSync(configPath).toString()
    ) as SecondBrainPublishedConfig[];
    const config = accountName
      ? configs.find((c) => c.name === accountName)
      : configs?.[0];
    defaultConfigs = { ...defaultConfigs, ...(config || {}) };
  } catch (e) {
    console.error("File read error: ", e);
  }
  return defaultConfigs;
};

const extractFilenameFromPath = (path: string): string =>
  path.split("/").pop() as string;

// TODO: type it
const addIdToSrcBlock = (orgData: any) => {
  if (orgData.type === "src-block") {
    orgData.id = uuidv4();
  }
  return orgData;
};

const syncNote = (filePath: string): Note[] => {
  // middleware here
  const note = collectNoteFromFile(filePath, [
    createLinkMiddleware(dirname(filePath)),
    addIdToSrcBlock,
  ]);
  if (!note.id) {
    throw "File is not a org file";
  }
  return [note];
};

const syncNotes = (dirPath: string): Note[] => {
  const notes = collectOrgNotesFromDir(dirPath);
  return notes;
};

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
  const files = readFiles(
    notes
      .flatMap((note) => note.meta.images?.map((img) => join(dirPath, img)))
      .filter((i) => !!i) as string[]
  );
  const formData = new FormData();
  notes.forEach((note) => formData.append("notes", JSON.stringify(note)));

  files.forEach((f) => {
    formData.append("files", f.blob, {
      filename: f.fileName,
      contentType: "file",
      header: {
        Authorization: `Bearer ${config.token}`,
      },
    });
  });
  try {
    const rspns = await axios({
      url: `${config.remoteAddress}/${config.version}/notes/bulk-upsert`,
      method: "put",
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${config.token}`,
      },
      data: formData,
    });
  } catch (e) {
    // TODO: master catch only http errors
    console.error("🦄: [line 62][index.ts] [35me: ", e.response.data);
    process.exit(1);
  }
};

const collectNotes = async (
  path: string,
  config: SecondBrainPublishedConfig
): Promise<void> => {
  const stats = statSync(path);
  const collectNoteFn = stats.isDirectory() ? syncNotes : syncNote;
  const dirPath = stats.isDirectory() ? path : dirname(path);
  const notes = collectNoteFn(path);
  await sendNotes(notes, config, dirPath);
};

const loadNotes = async (config: SecondBrainPublishedConfig) => {
  try {
    const rspns = await axios({
      method: "get",
      url: `${config.remoteAddress}/${config.version}/notes`,
    });
    return rspns.data;
  } catch (e) {
    console.log(e.response);
  }
};

enum CliCommand {
  Collect = "collect",
  Publish = "publish",
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
    await collectNotes(path, config);
  },
  [CliCommand.Collect]: async (config: SecondBrainPublishedConfig) => {
    const collectedNotes = await loadNotes(config);
  },
};

(async () => {
  const argv = yargs(hideBin(process.argv)).argv;
  const command = argv._[0] as CliCommand;
  const commandExecutor = commands[command];
  const path = argv._[1] as string;
  const accountName = argv.accountName as string;

  if (commandExecutor) {
    const config = {
      ...readConfig(accountName),
    };
    config.remoteAddress ||= argv.remoteAddress as string;
    config.token ||= argv.token as string;
    console.log(
      "Started with provided configs: ",
      JSON.stringify(config, null, 2)
    );

    await commandExecutor(config, path);
    return;
  }
  throw `Command ${command} is not supported`;
})();
