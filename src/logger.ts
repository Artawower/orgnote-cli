import { SecondBrainPublishedConfig } from 'config';
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
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
      new transports.Console({
        format: format.combine(format.colorize(), logFormat),
      }),
    ],
  });
}

function configureLogger(config?: Partial<SecondBrainPublishedConfig>): void {
  if (!config?.debug) {
    return;
  }
  logger.level = 'info';
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}
export function getLogger(
  config: Partial<SecondBrainPublishedConfig> = {}
): Logger {
  if (!logger) {
    initLogger();
  }
  configureLogger(config);
  return logger;
}
