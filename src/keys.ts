type SecretBase = {
  secretName: string;
  versionStage?: string;
  versionId?: string;
};

type SecretJson = SecretBase & {
  type: 'json';
  jsonKeys: Set<string>;
};

type SecretString = SecretBase & {
  type: 'string';
};

type SecretKeys = Record<string, SecretJson | SecretString>;

type KeyParseResult = {
  secretName: string;
  jsonKey?: string;
  versionStage?: string;
  versionId?: string;
};

const keyParse = (key: string): KeyParseResult => {
  const keys = key.split(':');
  return {
    secretName: keys[0],
    jsonKey: keys[1] || undefined,
    versionStage: keys[2] || undefined,
    versionId: keys[3] || undefined,
  };
};

export const transformSecrets = (secrets: string[]) => {
  const secretKeys: SecretKeys = {};

  secrets.forEach((s) => {
    const secret = keyParse(s);
    const k = [
      secret.secretName,
      secret.versionStage ?? '',
      secret.versionId ?? '',
    ].join(':');
    const secretKey = secretKeys[k];

    if (!secretKey) {
      if (secret.jsonKey) {
        secretKeys[k] = {
          secretName: secret.secretName,
          type: 'json',
          jsonKeys: new Set<string>([secret.jsonKey]),
          versionStage: secret.versionStage,
          versionId: secret.versionId,
        };
      } else {
        secretKeys[k] = {
          secretName: secret.secretName,
          type: 'string',
          versionStage: secret.versionStage,
          versionId: secret.versionId,
        };
      }
      return;
    }

    if (secretKey.type === 'json') {
      if (!secret.jsonKey) {
        throw new Error(`mixing string and json: ${secret.secretName}`);
      }

      secretKey.jsonKeys.add(secret.jsonKey);
    }
  });

  return Object.values(secretKeys);
};

export const normalizeSecretsManagerKeys = (keys: Record<string, string>) => {
  const newKeys: Record<string, string> = {};
  Object.keys(keys).forEach((envName) => {
    const [a, b, c, d] = keys[envName].split(':');
    const k = [a, b || '', c || '', d || ''].join(':');
    newKeys[envName] = k;
  });
  return newKeys;
};
