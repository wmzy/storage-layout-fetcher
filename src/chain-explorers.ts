import * as ff from 'fetch-fun';
import pThrottle from 'p-throttle';
import { ExplorerOptions, ExplorerType } from './types';

const commonClient = ff
  .create()
  .pipe(ff.error, (res) => {
    if (!res.ok) {
      return res.text().then((body) => {
        throw new Error(
          `unknown error: [url: ${res.url}] [HttpStatus: ${res.status}] - ${body}`
        );
      });
    }
  })
  .pipe(ff.json);

export function createEtherscanDefaultOptions(): ExplorerOptions {
  // https://docs.ehterscan.xyz/support/rate-limits
  const throttle = (f: any) =>
    pThrottle({ limit: 5, interval: 1000 })(
      pThrottle({ limit: 100_000, interval: 24 * 60 * 60 * 1000 })(f)
    );
  return {
    throttle,
    retry: 3,
  };
}

export function createBlockscoutDefaultOptions(): ExplorerOptions {
  return {
    // https://docs.blockscout.com/devs/apis/requests-and-limits
    throttle: pThrottle({ limit: 10, interval: 1000 }),
    retry: 3,
  };
}

export function createExplorerClient(
  type: ExplorerType,
  baseUrl: string,
  options: ExplorerOptions
) {
  const client = commonClient
    .with(ff.baseUrl, baseUrl)
    .pipe(ff.use, options.throttle)
    .pipe(ff.retry, options.retry);
  return {
    type,
    client,
    apiKey: options.apiKey,
  };
}

export function etherscan(url: string, options?: Partial<ExplorerOptions>) {
  return createExplorerClient('etherscan', url, {
    ...createEtherscanDefaultOptions(),
    ...options,
  });
}

export function blockscout(url: string, options?: Partial<ExplorerOptions>) {
  return createExplorerClient('blockscout', url, {
    ...createBlockscoutDefaultOptions(),
    ...options,
  });
}

const etherscanDefault = createEtherscanDefaultOptions();
export const mainnet = [
  etherscan('https://api.etherscan.io/api', etherscanDefault),
];
export const sepolia = [
  etherscan('https://api-sepolia.etherscan.io/api', etherscanDefault),
];

const mantlescanDefault = createEtherscanDefaultOptions();
export const mantle = [
  blockscout('https://explorer.mantle.xyz/api'),
  etherscan('https://api.mantlescan.xyz/api', mantlescanDefault),
];
export const mantleSepolia = [
  blockscout('https://explorer.sepolia.mantle.xyz/api'),
  etherscan('https://api-sepolia.mantlescan.xyz/api', mantlescanDefault),
];
