import { useState, useEffect } from "react";
import type { CardanoAPI } from "@/types/cardano";

export function useWalletConnector() {
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [api, setApi] = useState<CardanoAPI | null>(null);

  useEffect(() => {
    const storedDefaultWallet = localStorage.getItem("defaultWallet");
    if (storedDefaultWallet) {
      setDefaultWallet(storedDefaultWallet);
    }
  }, []);

  const checkWalletInstalled = (walletKey: string): boolean => {
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
      setConnectedWallets((prev) => [...prev, walletKey]);
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

  return {
    connectedWallets,
    defaultWallet,
    api,
    checkWalletInstalled,
    handleConnect,
    makeDefault,
  };
}
