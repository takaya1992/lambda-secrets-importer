import { transformSecrets, normalizeSecretsManagerKeys } from '../src/keys';

describe('transformSecrets', () => {
  test('success', () => {
    const secrets = [
      'secretA',
      'secretB:jsonKeyB1',
      'secretB:jsonKeyB2',
      'secretC::stageC1',
      'secretC::stageC2',
      'secretD:::versionD1',
      'secretD:::versionD2',
      'secretE:jsonKeyE1::versionE1',
      'secretE:jsonKeyE2::versionE1',
      'secretE:jsonKeyE2::versionE2',
    ];
    const got = transformSecrets(secrets);
    expect(got).toEqual([
      {
        secretName: 'secretA',
        type: 'string',
        versionStage: undefined,
        versionId: undefined,
      },
      {
        secretName: 'secretB',
        type: 'json',
        jsonKeys: new Set(['jsonKeyB1', 'jsonKeyB2']),
        versionStage: undefined,
        versionId: undefined,
      },
      {
        secretName: 'secretC',
        type: 'string',
        versionStage: 'stageC1',
        versionId: undefined,
      },
      {
        secretName: 'secretC',
        type: 'string',
        versionStage: 'stageC2',
        versionId: undefined,
      },
      {
        secretName: 'secretD',
        type: 'string',
        versionStage: undefined,
        versionId: 'versionD1',
      },
      {
        secretName: 'secretD',
        type: 'string',
        versionStage: undefined,
        versionId: 'versionD2',
      },
      {
        secretName: 'secretE',
        type: 'json',
        jsonKeys: new Set(['jsonKeyE1', 'jsonKeyE2']),
        versionStage: undefined,
        versionId: 'versionE1',
      },
      {
        secretName: 'secretE',
        type: 'json',
        jsonKeys: new Set(['jsonKeyE2']),
        versionStage: undefined,
        versionId: 'versionE2',
      },
    ]);
  });
});

describe('normalizeSecretsManagerKeys', () => {
  test('success', () => {
    const keys = {
      envA: 'secretA',
      envB: 'secretB::stageB',
      envC: 'secretC:::versionC',
      envD: 'secretD:jsonKeyD:stageD',
      envE: 'secretE:jsonKeyE::versionE',
    };
    expect(normalizeSecretsManagerKeys(keys)).toEqual({
      envA: 'secretA:::',
      envB: 'secretB::stageB:',
      envC: 'secretC:::versionC',
      envD: 'secretD:jsonKeyD:stageD:',
      envE: 'secretE:jsonKeyE::versionE',
    });
  });
});
