#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getLogger } from './logger.js';
import { OrgNotePublishedConfig, getConfig } from './config.js';
import { Logger } from 'winston';
import { CliCommand, handleCommand } from './commands/command-handlers.js';
import { clear } from './store/store.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { resolveHome } from './tools/with-home-dir.js';

let logger: Logger;

(async () => {
  const argv = yargs(hideBin(process.argv)).options({
    debug: {
      describe: 'Enable debug mode for verbose logging',
      type: 'boolean',
    },
    force: {
      describe: 'Clear all cache and force sync notes',
      type: 'boolean',
    },
    accountName: {
      describe: 'Account name to use for sync',
      type: 'string',
    },
  }).argv;
  const command = argv._[0] as CliCommand;
  const accountName = argv.accountName as string;
  const config = getConfig(argv, accountName);

  const path = (argv._[argv._.length - 1] as string) || config.rootFolder;
  logger = getLogger(config);

  if (argv.force) {
    logger.warn('Force sync enabled. All cache will be cleared.');
    clear();
  }

  logger.info('Current configuration: %o', config);

  createLogFile(config);

  try {
    await handleCommand(command, config, path)
  } catch (e) {
    logger.error('Unexpected error');
    // write an error to the lof file from config
    writeFileSync(config.logPath+'erorrs.log', e.toString());
    
    throw e;
  }
})();

function createLogFile(config: OrgNotePublishedConfig): void {
  if (!config.logPath) {
    return;
  }
  if (existsSync(config.logPath)) {
    return;
  }
  const logPath = resolveHome(config.logPath);
  mkdirSync(dirname(logPath), { recursive: true });
  writeFileSync(logPath, '');

}
