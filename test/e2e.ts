import { fetchStorageLayout, create } from '@/index';

describe('Storage Layout e2e Tests', () => {
  const itFn = process.env.CI ? it.skip : it;

  itFn(
    'should fetch storage layout of WETH9',
    async ({ expect }) => {
      const address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const layout = await fetchStorageLayout(
        create(),
        address
      );
      expect(layout).toMatchSnapshot();
    },
    5 * 60_000
  );

  itFn(
    'should fetch storage layout of cmETH',
    async ({ expect }) => {
      const address = '0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA';
      const layout = await fetchStorageLayout(
        create({ chainId: 5000 }),
        address
      );
      expect(layout).toMatchSnapshot();
    },
    5 * 60_000
  );
  itFn(
    'should fetch storage layout of cmETH implement by solidity',
    async ({ expect }) => {
      const address = '0x5a7b3cde8ac8d780af4797bf1517464ac54ca033';
      const layout = await fetchStorageLayout(
        create({ chainId: 5000 }),
        address
      );
      expect(layout).toMatchSnapshot();
    },
    5 * 60_000
  );
});
