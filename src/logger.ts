import { SecondBrainPublishedConfig } from 'config';
import { createLogger, format, Logger, transports } from 'winston';

const logFormat = format.printf(function (info) {
  return `${new Date().toISOString()}-${info.level}: info.message`;
});

let logger: Logger;

function initLogger(config: Partial<SecondBrainPublishedConfig> = {}): void {
  console.log(
    `✎: [logger.ts][${new Date().toString()}] config?.debug`,
    config?.debug
  );
  logger = createLogger({
    level: config?.debug ? 'info' : 'warning',
    format: format.combine(format.splat(), format.json()),
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
      new transports.Console({
        format: format.combine(format.colorize(), logFormat),
      }),
    ],
  });

  if (config.debug) {
    logger.add(
      new transports.Console({
        format: format.simple(),
      })
    );
  }
}
export function getLogger(
  config: Partial<SecondBrainPublishedConfig> = {}
): Logger {
  console.log('✎: [line 38][logger.ts] config: ', config);
  if (!logger) {
    initLogger(config);
  }
  return logger;
}
