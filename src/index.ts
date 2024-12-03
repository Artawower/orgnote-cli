#!/usr/bin/env node

import { getLogger } from './logger.js';
import { OrgNotePublishedConfig, getConfig } from './config.js';
import { CliCommand, handleCommand } from './commands/command-handlers.js';
import { initStore } from './store/store.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { resolveHome } from './tools/with-home-dir.js';
import { prettifyHttpError } from './tools/prettify-http-error';
import { AxiosError } from 'axios';
import { CliArguments, run } from './cli';

run(commandHandler);

async function commandHandler(
  command: string,
  options: CliArguments
): Promise<void> {
  if (!command) {
    getLogger().error('No command provided');
    return;
  }
  const accountName = options.accountName;

  const config = await getConfig(options as any, accountName);
  if (!config) {
    return;
  }

  const path = options.path || config.rootFolder;
  const logger = getLogger(config);

  const { clear } = initStore(config.name);
  if (options.force) {
    logger.warn('Force sync enabled. All cache will be cleared.');
    clear();
  }

  logger.debug('Current configuration: \n%o', getPrettyConfig(config));

  createLogFile(config);

  try {
    await handleCommand(command as CliCommand, config, path);
  } catch (e) {
    if (e instanceof AxiosError) {
      logger.error(`[index.ts] Unexpected error: ${prettifyHttpError(e)}`);
    } else {
      logger.error(`[index.ts] Unexpected error: %o`, e);
    }
    if (config.logPath) {
      writeFileSync(config.logPath, e);
    }
  }
}

function getPrettyConfig(
  config: OrgNotePublishedConfig
): OrgNotePublishedConfig {
  const { gpgPublicKey, gpgPrivateKey, ...rest } = config;
  rest.token = rest.token ? '********' : 'NO TOKEN PROVIDED';
  rest.gpgPrivateKeyPassphrase = rest.gpgPrivateKeyPassphrase
    ? '********'
    : 'NO GPG PASSPHRASE PROVIDED';
  return rest;
}

function createLogFile(config: OrgNotePublishedConfig): void {
  const logger = getLogger(config);
  if (!config.logPath) {
    logger.debug(`✎: [index.ts][createLogFile] no log file provided`);
    return;
  }
  const logPath = resolveHome(config.logPath);
  if (existsSync(logPath)) {
    logger.debug(
      `✎: [index.ts][createLogFile] log file already exists %o, do nothing`,
      config.logPath
    );
    return;
  }
  mkdirSync(dirname(logPath), { recursive: true });
  writeFileSync(logPath, '');
}
