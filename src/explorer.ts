import * as ff from 'fetch-fun';
import {
  BlockscoutContractInfo,
  ContractInfo,
  EtherscanContractSources,
  ExplorerApi,
  RpcResponse,
  Source,
  TopSource,
} from './types';

export async function fetchContract(address: string, explorers: ExplorerApi[]) {
  for (const explorer of explorers) {
    try {
      const contract = await (explorer.type === 'etherscan'
        ? fetchContractFromEtherscan(address, explorer)
        : fetchContractFromBlockscout(address, explorer));
      if (contract) {
        return contract;
      }
    } catch {}
  }
  return;
}

function fetchContractFromEtherscan(address: string, explorer: ExplorerApi) {
  const url = `?module=contract&action=getsourcecode&address=${address}${explorer.key ? `&apikey=${explorer.key}` : ''}`;
  return explorer.client
    .with(ff.url, url)
    .pipe(ff.fetchData<RpcResponse<[EtherscanContractSources]>>)
    .then((res) => res.result[0])
    .then((r) => {
      if (!r.SourceCode) {
        return null;
      }
      if (r.SourceCode.startsWith('{')) {
        return {
          sourceCode: JSON.parse(r.SourceCode.slice(1, -1)),
          contractName: r.ContractName,
          compilerVersion: r.CompilerVersion,
          constructorArguments: r.ConstructorArguments,
        };
      }
      return {
        sourceCode: {
          language: 'Solidity',
          sources: {
            ['contract.sol']: {
              content: r.SourceCode,
            },
          },
          settings: {
            optimizer: {
              enabled: r.OptimizationUsed === '1',
              runs: Number(r.Runs || 200),
            },
            evmVersion:
              r.EVMVersion?.toLowerCase() === 'default'
                ? undefined
                : r.EVMVersion,
            outputSelection: {
              '*': {
                '*': ['*'],
              },
            },
          },
        },
        contractFilePath: 'contract.sol',
        contractName: r.ContractName,
        compilerVersion: r.CompilerVersion,
        constructorArguments: r.ConstructorArguments,
      } as ContractInfo;
    });
}

async function fetchContractFromBlockscout(
  address: string,
  explorer: ExplorerApi
) {
  const url = `/v2/smart-contracts/${address}`;
  return Promise.all([
    explorer.client
      .with(ff.url, url)
      .pipe(ff.fetchData<BlockscoutContractInfo>),
    fetchContractSourcesFromBlockscout(address, explorer),
  ]).then(([json, sources]) => {
    const language = startCase(json.language);
    const sourceCode = {
      language,
      sources,
      settings: json.compiler_settings,
    };
    const compilerVersion = json.compiler_version;
    const constructorArguments = json.constructor_args?.slice(2);
    return {
      sourceCode,
      contractName: json.name,
      contractFilePath: json.file_path,
      compilerVersion,
      constructorArguments,
    } as ContractInfo;
  });
}
export function fetchContractSourcesFromBlockscout(
  address: string,
  explorer: ExplorerApi
) {
  const url = `?module=contract&action=getsourcecode&address=${address}`;
  return explorer.client
    .with(ff.url, url)
    .pipe(
      ff.fetchData<RpcResponse<[{ AdditionalSources?: Source[] } & TopSource]>>
    )
    .then((res) => {
      if (res.status === '1') {
        return res.result[0];
      }
      throw new Error(res.message);
    })
    .then((json) =>
      (json.AdditionalSources || []).reduce(
        (r, source) => {
          r[source.Filename] = { content: source.SourceCode };
          return r;
        },
        { [json.FileName]: { content: json.SourceCode } }
      )
    );
}

function startCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
