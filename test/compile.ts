import { readFile } from 'node:fs/promises';
import compile from '../src/compile';

describe('transform', () => {
  const itFn = process.env.CI ? it.skip : it;

  itFn('should compile success', async ({ expect }) => {
    const input = await readFile('test/fixtures/compile-input.json', 'utf-8');
    const result = compile('solc', input);
    await expect(result).resolves.toMatchSnapshot();
  });
});
