"use client";

import { WalletConnector, UploadWidget } from "@/components/Widgets";
import { WalletProvider } from "@/contexts/WalletContext";

export default function WidgetsPage() {
  return (
    <WalletProvider>
      <div className="flex flex-col gap-4 p-4">
        <div id="wallet-connector-container">
          <WalletConnector />
        </div>
        <div id="upload-widget-container">
          <UploadWidget />
        </div>
      </div>
    </WalletProvider>
  );
}
