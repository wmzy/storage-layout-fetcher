import { readFile } from 'node:fs/promises';
import compile from '../src/compile';

describe('transform', () => {
  it('should compile success', async ({ expect }) => {
    const input = await readFile('test/fixtures/compile-input.json', 'utf-8');
    const result = compile('solc', input);
    await expect(result).resolves.toMatchSnapshot();
  });
});
