"use client";
import WalletConnector from "@/components/WalletConnector";
import { WalletProvider } from "@/contexts/WalletContext";

export default function Home() {
  return (
    <WalletProvider>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Cardano Wallet iFrame Test</h1>
        <iframe
          src="/iframe-content"
          width="100%"
          height="200"
          className="border border-gray-300 rounded"
        />
        <WalletConnector />
      </div>
    </WalletProvider>
  );
}
