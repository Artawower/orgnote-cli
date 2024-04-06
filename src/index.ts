#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getLogger } from './logger.js';
import { OrgNotePublishedConfig, getConfig } from './config.js';
import { Logger } from 'winston';
import { CliCommand, handleCommand } from './commands/command-handlers.js';
import { initStore } from './store/store.js';
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
  const config = await getConfig(argv, accountName);

  const path = (argv._[argv._.length - 1] as string) || config.rootFolder;
  logger = getLogger(config);

  const { clear } = initStore(config.name);
  if (argv.force) {
    logger.warn('Force sync enabled. All cache will be cleared.');
    clear();
  }

  logger.info('Current configuration: %o', config);

  createLogFile(config);

  try {
    await handleCommand(command, config, path)
  } catch (e) {
    logger.error('Unexpected error', e.toString());
    // write an error to the lof file from config
    // writeFileSync(config.logPath, e.toString());
    throw e;
  }
})();

function createLogFile(config: OrgNotePublishedConfig): void {
  if (!config.logPath) {
    console.log('[line 60]: NO LOG FILE PROVIDED')
    return;
  }
  const logPath = resolveHome(config.logPath);
  if (existsSync(logPath)) {
    console.log(`[line 64]: LOG FILE ALREADY EXISTS ${config.logPath}`)
    return;
  }
  mkdirSync(dirname(logPath), { recursive: true });
  writeFileSync(logPath, '');

}
