import { fetchSecret } from './secretmanager';
import type { FetchSecret } from './secretmanager';
import { transformSecrets, normalizeSecretsManagerKeys } from './keys';

const secretsImport = async <T extends Record<string, string>>(
  secretsManagerKeys: T,
  fetcher: FetchSecret = fetchSecret,
): Promise<Record<keyof T, string>> => {
  const normalizedSecretManagerKeys =
    normalizeSecretsManagerKeys(secretsManagerKeys);

  const secretKeys = transformSecrets(Object.values(secretsManagerKeys));

  const keys: Record<string, string> = {};

  const loop = async (counter: number, max: number): Promise<void> => {
    if (counter >= max) {
      return Promise.resolve();
    }

    const key = secretKeys[counter];
    const response = await fetcher({
      secretName: key.secretName,
      versionStage: key.versionStage,
      versionId: key.versionId,
    });
    if (key.type === 'string') {
      const k = [
        key.secretName,
        '',
        key.versionStage || '',
        key.versionId || '',
      ].join(':');
      keys[k] = response['SecretString'];
    } else {
      const json = JSON.parse(response.SecretString);
      key.jsonKeys.forEach((jsonKey) => {
        const k = [
          key.secretName,
          jsonKey,
          key.versionStage || '',
          key.versionId || '',
        ].join(':');
        keys[k] = json[jsonKey];
      });
    }
    return loop(counter + 1, max);
  };

  await loop(0, secretKeys.length);

  const result: Record<string, string> = {};
  Object.keys(normalizedSecretManagerKeys).forEach((key) => {
    const keyName = normalizedSecretManagerKeys[key];
    result[key] = keys[keyName];
  });
  return result as Record<keyof T, string>;
};

/**
 * Import secret as  environment variables
 *
 * @deprecated
 */
const secretsImportToEnv = async (
  secretsManagerKeys: Record<string, string>,
  fetcher: FetchSecret = fetchSecret,
) => {
  const result = await secretsImport(secretsManagerKeys, fetcher);
  Object.keys(result).forEach((key) => {
    process.env[key] = result[key];
  });
};

export type { FetchSecret };
export { fetchSecret, secretsImport, secretsImportToEnv };
