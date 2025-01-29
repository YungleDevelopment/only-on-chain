"use client"

import { WalletConnector, UploadWidget } from "@/components/Widgets"

// Export the components individually for direct usage
export { WalletConnector, UploadWidget }

// The page component is still needed for direct access to /widgets
export default function WidgetsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div id="wallet-connector-container">
        <WalletConnector />
      </div>
      <div id="upload-widget-container">
        <UploadWidget />
      </div>
    </div>
  )
}

