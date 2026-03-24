import * as ff from 'fetch-fun';
import pThrottle from 'p-throttle';
import {
  ContractInfo,
  SourceApi,
  SourceConfig,
  BlockscanContractResponse,
  CompilerSettings,
} from './types';

const SOURCIFY_BASE_URL = 'https://sourcify.dev/server';
const BLOCKSCAN_BASE_URL = 'https://vscode.blockscan.com/srcapi';

type SourcifyApiV2Response = {
  sources: Record<string, { content: string }>;
  compilation: {
    language: 'Solidity' | 'Vyper';
    compiler: string;
    compilerVersion: string;
    compilerSettings: CompilerSettings;
    name: string;
    fullyQualifiedName: string;
  };
  chainId: string;
  address: string;
  match: 'match' | 'partial_match' | null;
};

function createBaseClient() {
  return ff
    .create()
    .pipe(ff.json)
    .pipe(ff.checkError, async (res) => {
      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `HTTP error: [url: ${res.url}] [status: ${res.status}] - ${body}`
        );
      }
    })
    ;
}

export function createSourcifyClient(config?: SourceConfig): SourceApi {
  const throttle = config?.throttle || ((f: any) => f);
  const retry = config?.retry ?? 3;
  
  const client = createBaseClient()
    .pipe(ff.use, throttle)
    .pipe(ff.retry, retry);

  return {
    type: 'sourcify',
    client: client.with(ff.baseUrl, config?.baseUrl || SOURCIFY_BASE_URL),
  };
}

export function createBlockscanClient(config?: SourceConfig): SourceApi {
  const throttle = config?.throttle || ((f: any) => f);
  const retry = config?.retry ?? 3;
  
  const client = createBaseClient()
    .pipe(ff.use, throttle)
    .pipe(ff.retry, retry);

  return {
    type: 'blockscan',
    client: client.with(ff.baseUrl, config?.baseUrl || BLOCKSCAN_BASE_URL) as any,
  };
}

export function createDefaultSources(config?: SourceConfig): SourceApi[] {
  const defaultThrottle = pThrottle({ limit: 10, interval: 1000 });
  const defaultConfig: SourceConfig = {
    throttle: defaultThrottle,
    retry: 3,
    ...config,
  };

  return [
    createSourcifyClient(defaultConfig),
    createBlockscanClient(defaultConfig),
  ];
}

async function fetchFromSourcify(
  chainId: number,
  address: string,
  source: SourceApi
): Promise<ContractInfo | null> {
  try {
    const fields = 'sources,compilation';
    const response = await source.client
      .with(ff.url, `/v2/contract/${chainId}/${address}?fields=${fields}`)
      .pipe(ff.fetchData<SourcifyApiV2Response>);

    if (!response.sources || Object.keys(response.sources).length === 0) {
      return null;
    }

    const { compilation } = response;
    const contractName = compilation.name;
    const fullyQualified = compilation.fullyQualifiedName;
    const contractFilePath = fullyQualified.includes(':')
      ? fullyQualified.split(':')[0]
      : Object.keys(response.sources)[0];

    return {
      sourceCode: {
        language: compilation.language,
        sources: response.sources,
        settings: compilation.compilerSettings || {},
      },
      contractFilePath,
      contractName,
      compilerVersion: compilation.compilerVersion,
    };
  } catch {
    return null;
  }
}

async function fetchFromBlockscan(
  chainId: number,
  address: string,
  source: SourceApi
): Promise<ContractInfo | null> {
  try {
    const response = await source.client
      .with(ff.url, `/${chainId}/${address}`)
      .pipe(ff.fetchData<BlockscanContractResponse>);

    if (response.status !== '1' || !response.result) {
      return null;
    }

    let sourceCode;
    try {
      sourceCode = JSON.parse(response.result);
    } catch {
      const ext = response.ext || 'sol';
      const fileName = `contract.${ext}`;
      sourceCode = {
        language: 'Solidity',
        sources: {
          [fileName]: { content: response.result },
        },
        settings: {
          optimizer: { enabled: false, runs: 200 },
        },
      };
    }

    const contractFilePath = Object.keys(sourceCode.sources || {})[0];
    const contractName = response.contractName;

    let compilerVersion = sourceCode.compilerVersion;
    if (!compilerVersion) {
      const evmVersion = sourceCode.settings?.evmVersion;
      if (evmVersion === 'paris' || evmVersion === 'shanghai') {
        compilerVersion = '0.8.20';
      } else {
        compilerVersion = '0.8.0';
      }
    }

    return {
      sourceCode: {
        language: sourceCode.language || 'Solidity',
        sources: sourceCode.sources || {},
        settings: sourceCode.settings || { optimizer: { enabled: false, runs: 200 } },
      },
      contractFilePath,
      contractName,
      compilerVersion,
    };
  } catch (e) {
    console.log('error', e);
    return null;
  }
}

export async function fetchContractFromSources(
  chainId: number,
  address: string,
  sources: SourceApi[]
): Promise<ContractInfo | null> {
  for (const source of sources) {
    const contract =
      source.type === 'sourcify'
        ? await fetchFromSourcify(chainId, address, source)
        : await fetchFromBlockscan(chainId, address, source);

    if (contract) {
      return contract;
    }
  }

  return null;
}
