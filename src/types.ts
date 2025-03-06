import type { Client } from 'fetch-fun';
export type Address = `0x${string}`;

export type ExplorerType = 'etherscan' | 'blockscout';
export type ExplorerApi = {
  type: ExplorerType;
  client: Client;
  key?: string;
};

export type ExplorerOptions = {
  throttle: <T extends (...args: any[]) => any>(fn: T) => T;
  retry: number;
  apiKey?: string;
};

export type Fetcher = { explorers: ExplorerApi[]; solcDir: string };

export type StorageLayout = {
  storage: unknown[];
  types: unknown;
};

export type RpcResponse<T extends any[]> = {
  status: '1' | '0';
  message: string;
  result: T;
};

export type Source = {
  SourceCode: string;
  Filename: string;
};

export type TopSource = {
  FileName: string;
  SourceCode: string;
};

export type EtherscanContractSources = {
  ContractName: string;
  SourceCode: string;
  ABI: string;
  CompilerVersion: string;
  OptimizationUsed: '1';
  Runs: '200';
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: '0' | '1';
  Implementation: `0x${string}`;
  SwarmSource: string;
};

export type CompilerSettings = Partial<{
  evmVersion: string;
  libraries: Record<string, string>;
  metadata: unknown;
  optimizer: unknown;
  outputSelection: Record<string, Record<string, string[]>>;
  remappings: string[];
  viaIR: boolean;
}>;

export type CompilerInput = {
  language: 'Vyper' | 'Solidity' | 'Yul' | 'SolidityAST' | 'EVMAssembly';
  sources: Record<string, { content: string }>;
  settings: CompilerSettings;
};

export type CompilerOutput = {
  contracts: Record<string, Record<string, { storageLayout: StorageLayout }>>;
};

export type ContractInfo = {
  sourceCode: CompilerInput;
  contractFilePath?: string;
  contractName: string;
  compilerVersion: string;
  constructorArguments?: string;
};

export type BlockscoutContractInfo = {
  language: string;
  file_path: string;
  name: string;
  source_code: string;
  compiler_settings: CompilerSettings;
  compiler_version: string;
  constructor_args: string[] | null;
};

export type SolcBuildInfo = {
  path: string;
  version: string;
  build: string;
  longVersion: string;
  keccak256: string;
  sha256: `0x${string}`;
  urls: string[];
};

export type SolcArtifact = {
  builds: SolcBuildInfo[];
  release: Record<string, string>;
  latestRelease: string;
};
