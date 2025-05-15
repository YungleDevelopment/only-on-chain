import React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  ConnectedWallet,
  AllSupportedWallets,
  TWalletAPI,
} from "../types/cardano";

const allSupportedWallets: AllSupportedWallets = {
  /*   yoroi: {
    name: "Yoroi",
    icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efbed9abdf9cf7e01d4_YoroiWallet.png",
    url: "https://yoroi-wallet.com/",
  }, */
/*   flint: {
    name: "Flint",
    icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95d7c5fb03f2d4b32b3ed_FlintWallet.svg",
    url: "https://flint-wallet.com/",
  },

  eternl: {
    name: "Eternl",
    icon: "https://uploads-ssl.webflow.com/66c3b779674915c288ca9998/66c95efca0ebecfedfca8599_EternlWallet.png",
    url: "https://eternl.io/",
  }, */
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
};

interface WalletContextType {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  wallets: AllSupportedWallets;
  connectedWallets: ConnectedWallet[];
  defaultWallet: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: (walletName: string) => void;
  setDefaultWallet: (walletName: string) => void;
  installedWallets: string[];
  getWalletApi: (walletName: string) => TWalletAPI | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(
    []
  );
  const [defaultWallet, setDefaultWallet] = useState<string | null>(
    localStorage.getItem("defaultWallet")
  );
  const [installedWallets, setInstalledWallets] = useState<string[]>([]);

  const detectConnectedWallets = useCallback(async () => {
    const cardano = window.cardano;
    if (!cardano) return;

    const connected: ConnectedWallet[] = [];

    for (const [key, wallet] of Object.entries(allSupportedWallets)) {
      if (cardano[key]) {
        try {
          const isEnabled = await cardano[key].isEnabled();
          if (isEnabled) {
            const api = await cardano[key].enable();
            connected.push({ name: wallet.name, api });
          }
        } catch (error) {
          console.error(`Error detecting ${wallet.name} connection:`, error);
        }
      }
    }

    setConnectedWallets(connected);
  }, []);

  const connectWallet = useCallback(
    async (walletName: string) => {
      const cardano = window.cardano;
      if (!cardano) return;

      const wallet = cardano[walletName.toLowerCase()];
      if (!wallet) return;

      try {
        const api = await wallet.enable();
        console.log("Connected wallet:", walletName, api);
        setConnectedWallets((prev) => [...prev, { name: walletName, api }]);

        if (!defaultWallet) {
          setDefaultWallet(walletName);

          localStorage.setItem("defaultWallet", walletName);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    },
    [defaultWallet]
  );

  useEffect(() => {
    if (!defaultWallet && connectedWallets.length > 0) {
      setDefaultWallet(connectedWallets[0].name);
    }
  }, [defaultWallet, connectedWallets]);

  const disconnectWallet = useCallback(
    (walletName: string) => {
      setConnectedWallets((prev) =>
        prev.filter((wallet) => wallet.name !== walletName)
      );

      if (defaultWallet === walletName) {
        setDefaultWallet(null);
        localStorage.removeItem("defaultWallet");
      }
    },
    [defaultWallet]
  );
  useEffect(() => {
    console.log("defaultWallet", defaultWallet);
  }, [defaultWallet]);

  const handleSetDefaultWallet = useCallback((walletName: string) => {
    setDefaultWallet(walletName);
    localStorage.setItem("defaultWallet", walletName);
  }, []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const detectInstalledWallets = useCallback(() => {
    const installed = Object.keys(allSupportedWallets).filter(
      (key) => window.cardano && window.cardano[key]
    );
    setInstalledWallets(installed);
  }, []);

  const getWalletApi = useCallback(
    (walletName: string) => {
      const wallet = connectedWallets.find(
        (w) => w.name.toLowerCase() === walletName.toLowerCase()
      );
      return wallet ? wallet.api : null;
    },
    [connectedWallets]
  );

  useEffect(() => {
    detectInstalledWallets();
    detectConnectedWallets();
    window.addEventListener("cardano", detectInstalledWallets);
    return () => window.removeEventListener("cardano", detectInstalledWallets);
  }, [detectInstalledWallets, detectConnectedWallets]);

  return (
    <WalletContext.Provider
      value={{
        isMenuOpen,
        openMenu,
        closeMenu,
        wallets: allSupportedWallets,
        connectedWallets,
        defaultWallet,
        connectWallet,
        disconnectWallet,
        setDefaultWallet: handleSetDefaultWallet,
        installedWallets,
        getWalletApi,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
