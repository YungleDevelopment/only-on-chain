import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from "react";
import type { CardanoAPI } from "@/types/cardano";

interface WalletContextType {
  connectedWallets: string[];
  defaultWallet: string | null;
  api: CardanoAPI | null;
  checkWalletInstalled: (walletKey: string) => Promise<boolean>;
  handleConnect: (walletKey: string) => Promise<void>;
  makeDefault: (walletKey: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [api, setApi] = useState<CardanoAPI | null>(null);

  useEffect(() => {
    const checkWallets = async () => {
      const storedDefaultWallet = localStorage.getItem("defaultWallet");
      const storedConnectedWallets = JSON.parse(
        localStorage.getItem("connectedWallets") || "[]"
      );

      if (storedDefaultWallet) {
        setDefaultWallet(storedDefaultWallet);
      }

      const confirmedConnectedWallets: string[] = [];
      for (const walletKey of storedConnectedWallets) {
        if (await checkWalletInstalled(walletKey)) {
          confirmedConnectedWallets.push(walletKey);
          if (walletKey === storedDefaultWallet) {
            await handleConnect(walletKey);
          }
        }
      }

      setConnectedWallets(confirmedConnectedWallets);
      localStorage.setItem(
        "connectedWallets",
        JSON.stringify(confirmedConnectedWallets)
      );
    };

    checkWallets();
  }, []);

  const checkWalletInstalled = async (walletKey: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    return !!window.cardano?.[walletKey];
  };

  const handleConnect = async (walletKey: string) => {
    if (typeof window === "undefined") return;

    try {
      const wallet = window.cardano?.[walletKey];
      if (!wallet) throw new Error("Wallet not installed");

      const walletApi = await wallet.enable();
      setApi(walletApi);
      setConnectedWallets((prev) => {
        const newConnectedWallets = prev.includes(walletKey)
          ? prev
          : [...prev, walletKey];
        localStorage.setItem(
          "connectedWallets",
          JSON.stringify(newConnectedWallets)
        );
        return newConnectedWallets;
      });
      if (!defaultWallet) {
        setDefaultWallet(walletKey);
        localStorage.setItem("defaultWallet", walletKey);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const makeDefault = (walletKey: string) => {
    setDefaultWallet(walletKey);
    localStorage.setItem("defaultWallet", walletKey);
  };

  const value = {
    connectedWallets,
    defaultWallet,
    api,
    checkWalletInstalled,
    handleConnect,
    makeDefault,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
