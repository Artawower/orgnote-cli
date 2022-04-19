#!/usr/bin/env node

import axios from "axios";
import { readFileSync, statSync } from "fs";
import {
  collectNoteFromFile,
  collectOrgNotesFromDir,
} from "second-brain-parser";
import { Note } from "second-brain-parser/dist/parser";

interface SecondBrainPublishedConfig {
  remoteAddress: string;
  token: string;
  baseDir: string;
  version: string;
}

const defaultUrl =
  process.env.SECOND_BRAIN_SERVER_URL || "http://localhost:3000";
// process.env.SECOND_BRAIN_SERVER_URL || "https://second-brain.org";

const configPath =
  process.env.SECOND_BRAIN_CONFIG_PATH || "~/.config/second-brain/config.json";

const baseDir = process.env.SECOND_BRAIN_BASE_DIR || "";

const readConfig = (): SecondBrainPublishedConfig => {
  try {
    return JSON.parse(readFileSync(configPath).toString());
  } catch (e) {
    return {
      remoteAddress: defaultUrl,
      token: process.env.SECOND_BRAIN_TOKEN || "",
      baseDir,
      version: process.env.SECOND_BRAIN_VERSION || "v1",
    };
  }
};

const syncNote = (filePath: string): Note[] => {
  // TODO: master check if path and token exist before start main operations
  const note = collectNoteFromFile(filePath);
  if (!note.id) {
    throw "File is not a org file";
  }
  return [note];
};

const syncNotes = (dirPath: string): Note[] => {
  const notes = collectOrgNotesFromDir(dirPath);
  return notes;
};

// TODO: master move connectors to external module
const sendNotes = async (notes: Note[], config: SecondBrainPublishedConfig) => {
  try {
    const rspns = await axios({
      url: `${config.remoteAddress}/api/${config.version}/notes/bulk-upsert`,
      method: "put",
      data: notes,
    });
    console.log("🦄: [line 55][index.ts] [35mrspns: ", rspns.status);
  } catch (e) {
    console.log("🦄: [line 62][index.ts] [35me: ", e.response);
  }
};

const collectNotes = async (
  path: string,
  config: SecondBrainPublishedConfig
): Promise<void> => {
  const stats = statSync(path);
  const collectNoteFn = stats.isDirectory() ? syncNotes : syncNote;
  const notes = collectNoteFn(path);
  await sendNotes(notes, config);
};

const loadNotes = async (config: SecondBrainPublishedConfig) => {
  try {
    const rspns = await axios({
      method: "get",
      url: `${config.remoteAddress}/api/${config.version}/notes`,
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
  [key in CliCommand]: (arg0: SecondBrainPublishedConfig) => Promise<void>;
} = {
  [CliCommand.Publish]: async (config: SecondBrainPublishedConfig) => {
    const syncPath = process.argv[3];
    await collectNotes(syncPath, config);
  },
  [CliCommand.Collect]: async (config: SecondBrainPublishedConfig) => {
    const collectedNotes = await loadNotes(config);
    console.log("🦄: [line 88][index.ts<2>] [35mcollectedNotes: ", collectedNotes);
  },
};

(async () => {
  const command = process.argv[2] as CliCommand;
  const commandExecutor = commands[command];
  if (commandExecutor) {
    const config = readConfig();
    await commandExecutor(config);
    return;
  }
  throw `Command ${command} is not supported`;
})();
