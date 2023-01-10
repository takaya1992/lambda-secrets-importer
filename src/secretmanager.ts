export type FetchSecretParams = {
  secretName: string;
  versionStage?: string;
  versionId?: string;
};

export type SecretResponse = {
  ARN: string;
  CreatedDate: number;
  Name: string;
  SecretBinary: Blob;
  SecretString: string;
  VersionId: string;
  VersionStages: string[];
};

export type FetchSecret = {
  (params: FetchSecretParams): Promise<SecretResponse>;
};

const PORT = process.env['PARAMETERS_SECRETS_EXTENSION_HTTP_PORT'] || 2773;

export const fetchSecret: FetchSecret = async ({
  secretName,
  versionStage,
  versionId,
}) => {
  const url = new URL(`http://localhost:${PORT}/secretsmanager/get`);
  const params = new URLSearchParams({ secretId: secretName });
  if (versionStage) {
    params.set('versionStage', versionStage);
  } else if (versionId) {
    params.set('versionId', versionId);
  }
  url.search = params.toString();
  const headers = new Headers({
    'X-Aws-Parameters-Secrets-Token': process.env['AWS_SESSION_TOKEN'] || '',
  });
  const response = await fetch(url.toString(), { headers });
  return response.json() as Promise<SecretResponse>;
};
