import { existsSync, readFileSync } from 'fs';
import os from 'os';
import { resolveHome } from './tools/with-home-dir.js';
import { getLogger } from './logger.js';
import { parseToml } from 'orgnote-api/utils';
import * as v from 'valibot';

const EncryptionTypeSchema = v.picklist([
  'disabled',
  'gpg-password',
  'gpg-keys',
  'gpgPassword',
  'gpgKeys',
]);

const AccountSchema = v.object({
  name: v.string(),
  remoteAddress: v.optional(v.string(), 'http://localhost:8000/v1'),
  token: v.optional(v.string(), ''),
  rootFolder: v.optional(v.string(), ''),
  logPath: v.optional(v.string(), '/tmp/log/orgnote'),
  debug: v.optional(v.boolean(), false),
  backupDir: v.optional(v.string(), ''),
  backupCount: v.optional(v.number(), 3),
  encrypt: v.optional(EncryptionTypeSchema, 'disabled'),
  gpgPassword: v.optional(v.string(), ''),
  gpgPublicKeyPath: v.optional(v.string(), ''),
  gpgPrivateKeyPath: v.optional(v.string(), ''),
  gpgPrivateKeyPassphrase: v.optional(v.string(), ''),
});

const ConfigSchema = v.object({
  accounts: v.optional(v.array(AccountSchema), []),
  root: v.optional(v.array(AccountSchema), []),
});

const getAccountsFromConfig = (config: v.InferOutput<typeof ConfigSchema>): Account[] => {
  if (config.accounts && config.accounts.length > 0) {
    return config.accounts;
  }
  return config.root ?? [];
};

type Account = v.InferOutput<typeof AccountSchema>;
type EncryptionType = 'disabled' | 'gpg-password' | 'gpg-keys';

export interface OrgNotePublishedConfig {
  name: string;
  remoteAddress: string;
  token: string;
  rootFolder: string;
  debug: boolean;
  logPath: string;
  backupCount: number;
  backupDir: string;
  encrypt: EncryptionType;
  gpgPassword: string;
  gpgPublicKeyPath: string;
  gpgPrivateKeyPath: string;
  gpgPrivateKeyPassphrase: string;
  gpgPublicKey?: string;
  gpgPrivateKey?: string;
}

const DEFAULT_CONFIG_PATH = `${os.homedir()}/.config/orgnote/config.toml`;

export const getConfigPath = (): string =>
  process.env.ORGNOTE_CONFIG_PATH || DEFAULT_CONFIG_PATH;

const readConfigFile = (): Account[] | null => {
  const logger = getLogger();
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    logger.warn(`Config file not found: ${configPath}`);
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf8');
    const config = parseToml(content, ConfigSchema);
    return getAccountsFromConfig(config);
  } catch (e) {
    logger.error(`Failed to read config: %o`, e);
    return null;
  }
};

const findAccount = (accounts: Account[], accountName?: string): Account | null => {
  if (!accountName) {
    return accounts[0] ?? null;
  }
  return accounts.find((a) => a.name === accountName) ?? null;
};

const normalizeEncryptType = (encrypt: string): EncryptionType => {
  if (encrypt === 'gpgPassword') return 'gpg-password';
  if (encrypt === 'gpgKeys') return 'gpg-keys';
  return encrypt as EncryptionType;
};

const mapAccountToPublished = (account: Account): OrgNotePublishedConfig => ({
  name: account.name,
  remoteAddress: account.remoteAddress,
  token: account.token,
  rootFolder: resolveHome(account.rootFolder),
  debug: account.debug,
  logPath: resolveHome(account.logPath),
  backupCount: account.backupCount,
  backupDir: resolveHome(account.backupDir),
  encrypt: normalizeEncryptType(account.encrypt),
  gpgPassword: account.gpgPassword,
  gpgPublicKeyPath: account.gpgPublicKeyPath,
  gpgPrivateKeyPath: account.gpgPrivateKeyPath,
  gpgPrivateKeyPassphrase: account.gpgPrivateKeyPassphrase,
});

const readGpgKeys = async (config: OrgNotePublishedConfig): Promise<{
  gpgPrivateKey: string;
  gpgPublicKey: string;
}> => {
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
};

const applyGpgKeys = async (
  config: OrgNotePublishedConfig
): Promise<OrgNotePublishedConfig> => {
  if (config.encrypt !== 'gpg-keys') {
    return config;
  }

  const { gpgPrivateKey, gpgPublicKey } = await readGpgKeys(config);
  return { ...config, gpgPrivateKey, gpgPublicKey };
};

const applyOverrides = (
  config: OrgNotePublishedConfig,
  override: Partial<OrgNotePublishedConfig>
): OrgNotePublishedConfig => ({
  ...config,
  ...Object.fromEntries(
    Object.entries(override).filter(([, v]) => v !== undefined)
  ),
});

export async function getConfig(
  override: Partial<OrgNotePublishedConfig> = {},
  accountName?: string
): Promise<OrgNotePublishedConfig | null> {
  const logger = getLogger(override);

  const accounts = readConfigFile();
  if (!accounts || accounts.length === 0) {
    logger.error('No accounts found in config file');
    return null;
  }

  const account = findAccount(accounts, accountName);
  if (!account) {
    logger.error(`Account "${accountName}" not found in config`);
    logger.info(`Available accounts: ${accounts.map((a) => a.name).join(', ')}`);
    return null;
  }

  const baseConfig = mapAccountToPublished(account);
  const configWithOverrides = applyOverrides(baseConfig, override);

  if (!configWithOverrides.token) {
    logger.error('No token provided for account "%s"', configWithOverrides.name);
    return null;
  }

  if (!configWithOverrides.rootFolder) {
    logger.error('No rootFolder provided for account "%s"', configWithOverrides.name);
    return null;
  }

  return applyGpgKeys(configWithOverrides);
}

export interface ValidateConfigResult {
  valid: boolean;
  configPath: string;
  rawContent: string;
  accounts: string[];
  errors: string[];
}

export function validateConfigFile(): ValidateConfigResult {
  const configPath = getConfigPath();
  const result: ValidateConfigResult = {
    valid: false,
    configPath,
    rawContent: '',
    accounts: [],
    errors: [],
  };

  if (!existsSync(configPath)) {
    result.errors.push(`Config file not found: ${configPath}`);
    return result;
  }

  try {
    result.rawContent = readFileSync(configPath, 'utf8');
  } catch (e) {
    result.errors.push(`Failed to read config file: ${e}`);
    return result;
  }

  try {
    const config = parseToml(result.rawContent, ConfigSchema);
    const accounts = getAccountsFromConfig(config);

    if (accounts.length === 0) {
      result.errors.push('No accounts defined in config (use [[accounts]] or [[root]])');
      return result;
    }

    result.accounts = accounts.map((a) => a.name);

    accounts.forEach((account, index) => {
      if (!account.name) {
        result.errors.push(`Account #${index + 1}: missing "name" field`);
      }
      if (!account.token) {
        result.errors.push(`Account "${account.name || index + 1}": missing "token" field`);
      }
      if (!account.rootFolder) {
        result.errors.push(`Account "${account.name || index + 1}": missing "rootFolder" field`);
      }
      if (account.encrypt === 'gpg-keys') {
        if (!account.gpgPublicKeyPath) {
          result.errors.push(`Account "${account.name}": gpg-keys encryption requires "gpgPublicKeyPath"`);
        }
        if (!account.gpgPrivateKeyPath) {
          result.errors.push(`Account "${account.name}": gpg-keys encryption requires "gpgPrivateKeyPath"`);
        }
      }
      if (account.encrypt === 'gpg-password' && !account.gpgPassword) {
        result.errors.push(`Account "${account.name}": gpg-password encryption requires "gpgPassword"`);
      }
    });

    result.valid = result.errors.length === 0;
  } catch (e) {
    if (e instanceof SyntaxError) {
      result.errors.push(`Invalid TOML syntax: ${e.message}`);
    } else if (e instanceof TypeError) {
      result.errors.push(`Invalid config format: ${e.message}`);
    } else {
      result.errors.push(`Validation error: ${e}`);
    }
  }

  return result;
}
