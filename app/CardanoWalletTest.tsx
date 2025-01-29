"use client";
import { useState} from "react";
import Image from "next/image";
import type { CardanoAPI, Cardano} from "../types/cardano";
import { allSupportedWallets } from "../types/cardano";

export default function CardanoWalletTest() {
  const [walletStatus, setWalletStatus] = useState<string>(
    "Select a wallet to connect"
  );
  const [api, setApi] = useState<CardanoAPI | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const connectWallet = async (walletKey: string) => {
    try {
      if (typeof window !== "undefined" && window.cardano) {
        const cardano: Cardano = window.cardano;

        if (cardano[walletKey]) {
          const walletApi = await cardano[walletKey].enable();
          setApi(walletApi);
          setConnectedWallet(walletKey);
          setWalletStatus(
            `${allSupportedWallets[walletKey].name} wallet connected successfully!`
          );
        } else {
          setWalletStatus(
            `${allSupportedWallets[walletKey].name} wallet not found. Make sure you have the extension installed.`
          );
        }
      } else {
        setWalletStatus(
          "Cardano API not found. Make sure you have a Cardano wallet extension installed."
        );
      }
    } catch (error) {
      setWalletStatus(
        `Error connecting to wallet: ${(error as Error).message}`
      );
    }
  };

  const getBalance = async () => {
    if (api) {
      try {
        const balance = await api.getBalance();
        setWalletStatus(`Current balance: ${balance}`);
      } catch (error) {
        setWalletStatus(`Error getting balance: ${(error as Error).message}`);
      }
    } else {
      setWalletStatus("Wallet not connected");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Cardano Wallet Test</h2>
      <p className="mb-4">{walletStatus}</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Object.entries(allSupportedWallets).map(([key, wallet]) => (
          <button
            key={key}
            onClick={() => connectWallet(key)}
            className={`flex flex-col items-center p-2 border rounded ${
              connectedWallet === key ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <Image
              src={wallet.icon || "/placeholder.svg"}
              alt={wallet.name}
              width={48}
              height={48}
            />
            <span className="mt-2">{wallet.name}</span>
          </button>
        ))}
      </div>
      {api && (
        <button
          onClick={getBalance}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Get Balance
        </button>
      )}
    </div>
  );
}
