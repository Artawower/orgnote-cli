import { OrgNotePublishedConfig } from 'config';
import { dirname } from 'path';
import { resolveHome } from './tools/with-home-dir.js';
import { createLogger, format, Logger, transports, config } from 'winston';

let logger: Logger;

function initLogger(): void {
  logger = createLogger({
    levels: config.cli.levels,
    level: 'warn',
    format: format.combine(format.splat(), format.json()),
    transports: [
      new transports.Console({
        format: format.combine(format.colorize({ all: true }), format.simple()),
      }),
    ],
  });
}

function configureLogger(config?: Partial<OrgNotePublishedConfig>): void {
  if (!config?.debug) {
    return;
  }
  if (!config.logPath) {
    logger.debug(`[logger.ts][configureLogger]: no log path provided`);
    return;
  }

  logger.level = 'debug';
  const dirName = dirname(config.logPath);
  const fileName = config.logPath.split('/').pop();
  [
    new transports.File({
      dirname: resolveHome(dirName),
      filename: fileName,
      level: 'debug',
    }),
  ].forEach((transport) => logger.add(transport));
}
export function getLogger(
  config: Partial<OrgNotePublishedConfig> = {}
): Logger {
  if (!logger) {
    initLogger();
  }
  configureLogger(config);
  return logger;
}
