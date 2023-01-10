import { fetchSecret } from './secretmanager';
import type { FetchSecret } from './secretmanager';
import { transformSecrets, normalizeSecretsManagerKeys } from './keys';

const secretsImport = async (fetcher: FetchSecret = fetchSecret) => {
  const secretsManagerKeys = JSON.parse(
    process.env['SECRETS_MANAGER_KEYS'],
  ) as Record<string, string>;
  const normalizedSecretManagerKeys =
    normalizeSecretsManagerKeys(secretsManagerKeys);

  const secretKeys = transformSecrets(Object.values(secretsManagerKeys));

  const keys: Record<string, string> = {};

  const loop = async (counter: number, max: number) => {
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

  Object.keys(normalizedSecretManagerKeys).forEach((envName) => {
    const keyName = normalizedSecretManagerKeys[envName];
    process.env[envName] = keys[keyName];
  });
};

export type { FetchSecret };
export { fetchSecret, secretsImport };
