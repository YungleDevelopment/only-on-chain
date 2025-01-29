"use client";
import WalletConnector from "@/components/WalletConnector";
import { WalletProvider } from "@/contexts/WalletContext";

export default function ConnectWalletPage() {
  return (
    <WalletProvider>
      <WalletConnector />
    </WalletProvider>
  );
}
