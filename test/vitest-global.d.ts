/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHERSCAN_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
