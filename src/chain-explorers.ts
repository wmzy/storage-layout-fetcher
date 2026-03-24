import {
  SourceApi,
  Fetcher,
} from './types';
import {
  createDefaultSources,
  createSourcifyClient,
  createBlockscanClient,
} from './source';

export {
  createDefaultSources,
  createSourcifyClient,
  createBlockscanClient,
};

export function createFetcher(
  chainId: number,
  options?: {
    sources?: SourceApi[];
    solcDir?: string;
  }
): Fetcher {
  const sources = options?.sources || createDefaultSources();
  const solcDir = options?.solcDir;

  return {
    explorers: [],
    sources,
    chainId,
    solcDir: solcDir || '',
  };
}

export const mainnet = createFetcher(1);
export const sepolia = createFetcher(11155111);
export const mantle = createFetcher(5000);
export const mantleSepolia = createFetcher(5003);
