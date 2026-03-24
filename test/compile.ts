import { readFile } from 'node:fs/promises';
import compile from '../src/compile';
import { install } from '../src/svm';
import * as path from 'node:path';
import * as os from 'node:os';

describe('transform', () => {
  const itFn = process.env.CI ? it.skip : it;

  itFn(
    'should compile success',
    async ({ expect }) => {
      const input = await readFile('test/fixtures/compile-input.json', 'utf-8');
      const solcPath = await install(
        '0.8.28',
        path.join(os.tmpdir(), 'storage-layout-fetcher-test', 'solc-0.8.28')
      );
      const result = compile(solcPath, input);
      await expect(result).resolves.toMatchSnapshot();
    },
    10 * 60_000
  );
});
