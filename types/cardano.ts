export interface WalletInfo {
    name: string
    icon: string
    url: string
  }
  
  export interface CardanoWallet {
    enable: () => Promise<CardanoAPI>
    isEnabled: () => Promise<boolean>
    name: string
    icon: string
  }
  
  export interface CardanoAPI {
    getNetworkId: () => Promise<number>
    getUtxos: () => Promise<string[] | undefined>
    getBalance: () => Promise<string>
    getUsedAddresses: () => Promise<string[]>
    getUnusedAddresses: () => Promise<string[]>
    getChangeAddress: () => Promise<string>
    signTx: (tx: string, partialSign: boolean) => Promise<string>
    submitTx: (tx: string) => Promise<string>
    // Add other methods as needed
  }
  
  export type TSupportedWallets = {
    [key: string]: WalletInfo
  }
  
  export interface Cardano {
    [key: string]: CardanoWallet
  }
  
  declare global {
    interface Window {
      cardano?: Cardano
    }
  }
  
  export const allSupportedWallets: TSupportedWallets = {
    yoroi: {
      name: "Yoroi",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efbed9abdf9cf7e01d4_YoroiWallet.png",
      url: "https://yoroi-wallet.com/",
    },
    flint: {
      name: "Flint",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95d7c5fb03f2d4b32b3ed_FlintWallet.svg",
      url: "https://flint-wallet.com/",
    },
    nami: {
      name: "Nami",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efbb308f8806dd4449a_NamiWallet.png",
      url: "https://namiwallet.io/",
    },
    eternl: {
      name: "Eternl",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efca0ebecfedfca8599_EternlWallet.png",
      url: "https://eternl.io/",
    },
    gero: {
      name: "Gero",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efb91d542e643bf5ed4_GeroWallet.png",
      url: "https://gerowallet.io/",
    },
    nufi: {
      name: "Nufi",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efbbee1abc10aea26ad_NufiWallet.png",
      url: "https://nu.fi/",
    },
    begin: {
      name: "Begin",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efb08b6a125a4af479b_BeginWallet.png",
      url: "https://begin.is/",
    },
    lace: {
      name: "Lace",
      icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efbf25ef16633cdd528_LaceWallet.png",
      url: "https://www.lace.io/",
    },
  }
  
  