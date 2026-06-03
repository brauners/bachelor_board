/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VICTORY_SAMPLE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
