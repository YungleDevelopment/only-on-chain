"use client";
import { WalletConnector, UploadWidget } from "@/components/Widgets";
import { WalletProvider } from "@/contexts/WalletContext";
declare global {
  interface Window {
    Widgets: typeof Widgets;
  }
}
// Export components for direct usasge
export const Widgets = {
  WalletConnector,
  UploadWidget,
  Provider: WalletProvider,
};

// Make components available globally
if (typeof window !== "undefined") {
  window.Widgets = Widgets;
}

export default function StandalonePage() {
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
