import { readFileSync } from 'fs';
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
import os from 'os';
import { resolveHome } from './tools/with-home-dir.js';

export interface OrgNotePublishedConfig {
  remoteAddress: string;
  token: string;
  rootFolder: string;
  version: string;
  name?: string;
  debug?: boolean;
  logPath?: string;
  backupCount?: number;
  backupDir?: string;
  encrypt?: ModelsPublicNoteEncryptionTypeEnum;
  gpgPassword?: string;
  gpgPublicKeyPath?: string;
  gpgPrivateKeyPath?: string;
  gpgPrivateKeyPassphrase?: string;

  // TODO: Configurations after init. Move to class
  gpgPublicKey?: string;
  gpgPrivateKey?: string;
}

const defaultUrl = process.env.OrgNote_SERVER_URL || 'http://localhost:8000/v1';
// process.env.ORGNOTE_SERVER_URL || "https://orgnote.org";

const configPath =
  process.env.OrgNote_CONFIG_PATH ||
  `${os.homedir()}/.config/orgnote/config.json`;

const rootFolder = process.env.OrgNote_BASE_DIR || '';
export async function getConfig(
  override: Partial<OrgNotePublishedConfig>,
  accountName?: string
): Promise<OrgNotePublishedConfig> {
  let defaultConfigs: OrgNotePublishedConfig = {
    remoteAddress: defaultUrl,
    token: process.env.OrgNote_TOKEN || '',
    rootFolder,
    version: process.env.OrgNote_VERSION || 'v1',
    logPath: '/tmp/log/orgnote',
    backupCount: 3,
  };

  try {
    const configs = JSON.parse(
      readFileSync(configPath).toString()
    ) as OrgNotePublishedConfig[];
    const config = accountName
      ? configs.find((c) => c.name === accountName)
      : configs?.[0];
    defaultConfigs = { ...defaultConfigs, ...(config || {}), ...override };
  } catch (e) {
    console.error('[file read error] %o', e);
  }

  if (defaultConfigs.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgKeys) {
    const { gpgPrivateKey, gpgPublicKey } = await readGpgKeys(defaultConfigs);
    defaultConfigs.gpgPrivateKey = gpgPrivateKey;
    defaultConfigs.gpgPublicKey = gpgPublicKey;
  }

  return {
    ...defaultConfigs,
    backupDir: resolveHome(defaultConfigs.backupDir || ''),
    rootFolder: resolveHome(defaultConfigs.rootFolder || ''),
  };
}

async function readGpgKeys(config: OrgNotePublishedConfig): Promise<{
  gpgPrivateKey: string;
  gpgPublicKey: string;
}> {
  const privateArmoredKey = readFileSync(
    resolveHome(config.gpgPrivateKeyPath),
    'utf8'
  );

  const publicArmoredKey = readFileSync(
    resolveHome(config.gpgPublicKeyPath),
    'utf8'
  );

  return {
    gpgPrivateKey: privateArmoredKey,
    gpgPublicKey: publicArmoredKey,
  };
}
