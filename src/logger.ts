import { OrgNotePublishedConfig } from 'config';
import { dirname } from 'path';
import { resolveHome } from './tools/with-home-dir.js';
import { createLogger, format, Logger, transports } from 'winston';

const logFormat = format.printf(function (info) {
  return `${new Date().toISOString()}-${info.level}: info.message`;
});

let logger: Logger;

function initLogger(): void {
  logger = createLogger({
    level: 'warning',
    format: format.combine(format.splat(), format.json()),
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), logFormat),
      }),
    ],
  });
}

function configureLogger(config?: Partial<OrgNotePublishedConfig>): void {
  if (!config?.debug) {
    return;
  }
  if (!config.logPath) {
    console.warn('No log path provded');
    return;
  }

  logger.level = 'info';
  const dirName = dirname(config.logPath);
  const fileName = config.logPath.split('/').pop();
  [
    new transports.File({
      dirname: resolveHome(dirName),
      filename: fileName,
      level: 'info',
    }),
    new transports.Console({
      format: format.simple(),
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
