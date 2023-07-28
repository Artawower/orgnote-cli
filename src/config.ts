import { readFileSync } from 'fs';
import os from 'os';

export interface SecondBrainPublishedConfig {
  remoteAddress: string;
  token: string;
  rootFolder: string;
  version: string;
  name?: string;
  debug?: boolean;
  logPath?: string;
  backupCount?: number;
  backupDir?: string;
}

const defaultUrl =
  process.env.SECOND_BRAIN_SERVER_URL || 'http://localhost:8000/v1';
// process.env.SECOND_BRAIN_SERVER_URL || "https://second-brain.org";

const configPath =
  process.env.SECOND_BRAIN_CONFIG_PATH ||
  `${os.homedir()}/.config/second-brain/config.json`;

const rootFolder = process.env.SECOND_BRAIN_BASE_DIR || '';
export function getConfig(
  override: Partial<SecondBrainPublishedConfig>,
  accountName?: string
): SecondBrainPublishedConfig {
  let defaultConfigs = {
    remoteAddress: defaultUrl,
    token: process.env.SECOND_BRAIN_TOKEN || '',
    rootFolder,
    version: process.env.SECOND_BRAIN_VERSION || 'v1',
    logPath: '/tmp/log/second-brain',
    backupCount: 3,
  };

  try {
    const configs = JSON.parse(
      readFileSync(configPath).toString()
    ) as SecondBrainPublishedConfig[];
    const config = accountName
      ? configs.find((c) => c.name === accountName)
      : configs?.[0];
    defaultConfigs = { ...defaultConfigs, ...(config || {}), ...override };
  } catch (e) {
    console.error('[file read error] %o', e);
  }
  return defaultConfigs;
}
