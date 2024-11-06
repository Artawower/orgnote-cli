#!/usr/bin/env node

import yargs from 'yargs';
import { getLogger } from './logger.js';
import { OrgNotePublishedConfig, getConfig } from './config.js';
import { CliCommand, handleCommand } from './commands/command-handlers.js';
import { initStore } from './store/store.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { resolveHome } from './tools/with-home-dir.js';
import { prettifyHttpError } from './tools/prettify-http-error';
import { AxiosError } from 'axios';

(async () => {
  const yarg = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .positional('command', {
      type: 'string',
      describe: 'Command to run',
      choices: Object.values(CliCommand),
    })
    .demandCommand(1)
    .example(
      '$0 sync --force --accountName myAccountName',
      'run sync command with force and accountName options'
    )
    .options({
      debug: {
        describe: 'Enable debug mode for verbose logging',
        type: 'boolean',
      },
      rootFolder: {
        describe:
          'Root folder to sync, optional field when specified in config file',
        type: 'string',
      },
      force: {
        describe: 'Clear all cache and force sync notes',
        type: 'boolean',
      },
      accountName: {
        describe: 'Account name to use for sync',
        type: 'string',
      },
    });

  const argv = await yarg.parse();

  const command = argv.command as CliCommand;

  if (!command) {
    getLogger().error('No command provided');
    yarg.showHelp();
    return;
  }
  const accountName = argv.accountName;

  const config = await getConfig(argv, accountName);
  if (!config) {
    return;
  }

  const path = (argv._[argv._.length - 1] as string) || config.rootFolder;
  const logger = getLogger(config);

  const { clear } = initStore(config.name);
  if (argv.force) {
    logger.warn('Force sync enabled. All cache will be cleared.');
    clear();
  }

  logger.debug('Current configuration: \n%o', getPrettyConfig(config));

  createLogFile(config);

  try {
    await handleCommand(command, config, path);
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
})();

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
