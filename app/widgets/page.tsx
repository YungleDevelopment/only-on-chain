"use client"

declare global {
  interface Window {
    WidgetsPage: typeof WidgetsPage;
  }
}

import dynamic from "next/dynamic"
import { WalletProvider } from "@/contexts/WalletContext"

const WalletConnector = dynamic(() => import("@/components/Widgets").then((mod) => mod.WalletConnector), {
  ssr: false,
})
const UploadWidget = dynamic(() => import("@/components/Widgets").then((mod) => mod.UploadWidget), { ssr: false })

export default function WidgetsPage() {
  return (
    <WalletProvider>
      <div id="wallet-connector-container">
        <WalletConnector />
      </div>
      <div id="upload-widget-container">
        <UploadWidget />
      </div>
    </WalletProvider>
  )
}

// Make it available for direct import
if (typeof window !== "undefined") {
  ;(window as Window & typeof globalThis).WidgetsPage = WidgetsPage
}

