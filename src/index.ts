#!/usr/bin/env node

import { readFileSync, statSync } from "fs";
import { collectNoteFromFile, collectNotesFromDir } from "second-brain-parser";
import { Note } from "second-brain-parser/dist/parser";

interface SecondBrainPublishedConfig {
  remoteAddress: string;
  token: string;
  baseDir: string;
}

const defaultUrl =
  process.env.SECOND_BRAIN_SERVER_URL || "https://second-brain.org";

const configPath =
  process.env.SECOND_BRAIN_CONFIG_PATH || "~/.config/second-brain/config.json";

const baseDir = process.env.SECOND_BRAIN_BASE_DIR || "";

const readConfig = (path: string): SecondBrainPublishedConfig => {
  try {
    return JSON.parse(readFileSync(path).toString());
  } catch (e) {
    return {
      remoteAddress: defaultUrl,
      token: process.env.SECOND_BRAIN_TOKEN || "",
      baseDir,
    };
  }
};

// TODO: master promise axios
const sendNotes = (notes: Note[]): void => {
  console.log("🦄: [line 35][index.ts<2>] [35mnotes: ", notes);
};

const syncNote = (filePath: string): void => {
  // TODO: master check if path and token exist before start main operations
  const note = collectNoteFromFile(filePath);
  sendNotes([note]);
};

const syncNotes = (dirPath: string): void => {
  const notes = collectNotesFromDir(dirPath);
  sendNotes(notes);
};

export const collectNotes = (path: string): void => {
  const { isDirectory } = statSync(path);
  const fn = isDirectory() ? syncNotes : syncNote;
  fn(path);
};

const syncPath = process.argv[2];
collectNotes(syncPath);
