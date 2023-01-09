import { secretsImport, FetchSecret } from '../src/index';

const DB = {
  secretNameA: 'secretBodyA',
  secretNameB: JSON.stringify({ keyA: 'keyBodyA', keyB: 'keyBodyB' }),
  secretNameC: 'secretBodyC',
};

const mockedFetchSecret: FetchSecret = (params) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const record = DB[params.secretName];
      if (!record) {
        reject();
      }
      resolve({
        ARN: 'a',
        CreatedDate: 1,
        Name: params.secretName,
        SecretBinary: undefined,
        SecretString: record,
        VersionId: '',
        VersionStages: [],
      });
    }, 1000);
  });
};

describe('secretsImport', () => {
  test('success', async () => {
    process.env['SECRETS_MANAGER_KEYS'] =
      '{"ENV_A": "secretNameA", "ENV_B1": "secretNameB:keyA", "ENV_B2": "secretNameB:keyB", "ENV_C": "secretNameC"}';

    await secretsImport(mockedFetchSecret);

    expect(process.env['ENV_A']).toBe('secretBodyA');
    expect(process.env['ENV_B1']).toBe('keyBodyA');
    expect(process.env['ENV_B2']).toBe('keyBodyB');
    expect(process.env['ENV_C']).toBe('secretBodyC');
  });
});
