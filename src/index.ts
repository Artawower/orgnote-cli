#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getLogger } from './logger.js';
import { getConfig } from './config.js';
import { format, transports } from 'winston';
import { CliCommand, handleCommand } from './command-handlers.js';

const logger = getLogger();


(async () => {
  const argv = yargs(hideBin(process.argv)).options({
    debug: {
      describe: 'Enable debug mode for verbose logging',
      type: 'boolean',
    },
  }).argv;
  const command = argv._[0] as CliCommand;
  const accountName = argv.accountName as string;

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
    await handleCommand(command, config, path)
  } catch (e) {
    logger.error(e);
  }
})();
