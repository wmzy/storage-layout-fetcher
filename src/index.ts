import * as os from 'node:os';
import compile from './compile';
import { fetchContract } from './explorer';
import { fetchContractFromSources, createDefaultSources } from './source';
import { install } from './svm';
import { transform } from './transform';
import {
  Address,
  Fetcher,
  ContractInfo,
  StorageLayout,
  CompilerOutput,
  SourceApi,
} from './types';
import * as semver from 'semver';
import * as path from 'node:path';

export * from './source';
export * from './types';

export function create(
  options?: Partial<Fetcher> & { etherscanApiKey?: string }
): Fetcher {
  const { explorers, solcDir, etherscanApiKey, sources, chainId } = options || {};
  
  const defaultSources = createDefaultSources();
  
  return {
    explorers: explorers || [],
    solcDir: solcDir || path.join(os.tmpdir(), 'storage-layout-fetcher'),
    sources: sources || defaultSources,
    chainId: chainId || 1,
  };
}

export async function fetchStorageLayout(
  client: Fetcher,
  address: Address
): Promise<StorageLayout> {
  let contractInfo: ContractInfo | null = null;

  if (client.sources && client.chainId) {
    contractInfo = await fetchContractFromSources(
      client.chainId,
      address,
      client.sources
    );
  }

  if (!contractInfo && client.explorers && client.explorers.length > 0) {
    contractInfo = await fetchContract(address, client.explorers);
  }

  if (!contractInfo) {
    throw new Error('Contract verify information not found');
  }

  if (contractInfo.sourceCode.language === 'Vyper') {
    throw new Error('Vyper contracts are not supported yet.');
  }
  
  return getStorageLayout(
    await ensureSolidityVersion(contractInfo),
    client.solcDir
  );
}

async function getStorageLayout(
  contractInfo: ContractInfo,
  solcDir: string
): Promise<StorageLayout> {
  const { sourceCode, compilerVersion, contractFilePath, contractName } =
    contractInfo;
  const input = {
    ...sourceCode,
    settings: {
      ...sourceCode.settings,
      outputSelection: {
        [contractFilePath || '*']: {
          [contractName]: ['storageLayout'],
        },
      },
    },
  };
  const version = semver.clean(compilerVersion)!;
  const solcPath = await install(
    version,
    path.join(solcDir, 'solc-' + version)
  );
  const out = await compile(solcPath, JSON.stringify(input));
  const output = JSON.parse(out) as CompilerOutput;
  if (contractFilePath) {
    const fileContracts = output.contracts[contractFilePath];
    if (!fileContracts) {
      throw new Error(`Contract file not found: ${contractFilePath}`);
    }
    const contract = fileContracts[contractName];
    if (!contract) {
      throw new Error(`Contract not found: ${contractName}`);
    }
    return contract.storageLayout;
  }
  const contracts = Object.values(output.contracts);
  const c = contracts.find((c) => contractName in c);
  if (!c) {
    throw new Error(`Contract not found: ${contractName}`);
  }
  const targetContract = c[contractName];
  if (!targetContract) {
    throw new Error(`Contract not found: ${contractName}`);
  }
  return targetContract.storageLayout;
}

async function ensureSolidityVersion(contractInfo: ContractInfo) {
  const { sourceCode, compilerVersion } = contractInfo;
  const solidityVersion = semver.clean(compilerVersion)!;
  if (semver.lte(solidityVersion, '0.6.8')) {
    const { sources } = sourceCode;
    const newSources = Object.keys(sources).reduce(
      (r, source) => {
        const src = sources[source];
        if (!src) {
          return r;
        }
        return {
          ...r,
          [source]: { content: transform(src.content) },
        };
      },
      {} as Record<string, { content: string }>
    );

    return {
      ...contractInfo,
      sourceCode: { ...sourceCode, sources: newSources },
      compilerVersion: '0.6.8',
    };
  }
  return contractInfo;
}
