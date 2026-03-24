/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_ETHERSCAN_API_KEY: string;
}

type ImportMeta = {
  readonly env: ImportMetaEnv;
}
