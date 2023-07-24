#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getLogger } from './logger.js';
import { getConfig } from './config.js';
import { Logger } from 'winston';
import { CliCommand, handleCommand } from './command-handlers.js';

let logger: Logger;

(async () => {
  const argv = yargs(hideBin(process.argv)).options({
    debug: {
      describe: 'Enable debug mode for verbose logging',
      type: 'boolean',
    },
  }).argv;
  const command = argv._[0] as CliCommand;
  const accountName = argv.accountName as string;
  const config = getConfig(argv, accountName);

  const path = (argv._[argv._.length - 1] as string) || config.rootFolder;
  logger = getLogger(config);

  logger.info('Current configuration: %o', config);

  try {
    await handleCommand(command, config, path)
  } catch (e) {
    logger.error(e);
  }
})();
