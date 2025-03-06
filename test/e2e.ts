import { fetchStorageLayout, create } from '@/index';

describe('Storage Layout e2e Tests', () => {
  it(
    'should fetch storage layout of WETH9',
    async ({ expect }) => {
      const address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const layout = await fetchStorageLayout(
        create({ etherscanApiKey: import.meta.env.VITE_ETHERSCAN_API_KEY }),
        address
      );
      expect(layout).toMatchSnapshot();
    },
    5 * 60_000
  );
});
