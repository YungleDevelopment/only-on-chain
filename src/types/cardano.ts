export interface CardanoWindow {
  [key: string]: {
    enable: () => Promise<any>;
    isEnabled: () => Promise<boolean>;
    apiVersion: string;
    name: string;
    icon: string;
  };
}

declare global {
  interface Window {
    cardano: CardanoWindow | null;
  }
}

export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
}

export interface AllSupportedWallets {
  [key: string]: WalletInfo;
}

export type ConnectedWallet = {
  name: string;
  api: any;
};

export interface TWalletAPI {
  // General wallet info
  name: string;
  icon: string;
  apiVersion: string;

  // Network state
  getNetworkId(): Promise<number>;
  getUtxos(): Promise<string[] | null>;
  getBalance(): Promise<string>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;

  // Transaction methods
  signTx(tx: string, partialSign?: boolean): Promise<string>;
  signData(addr: string, payload: string): Promise<string>;
  submitTx(tx: string): Promise<string>;

  // Delegation
  getDelegation(): Promise<{
    poolId: string | null;
    rewards: string;
  }>;

  // Experimental features
  experimental?: {
    getCollateral?: () => Promise<string[]>;
    mintAsset?: (params: any) => Promise<string>;
    submitCip95?: (params: any) => Promise<string>;
  };

  // CIP-30 Standard
  enable(): Promise<TWalletAPI>;
  isEnabled(): Promise<boolean>;
}
