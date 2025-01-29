import type React from "react"
import dynamic from "next/dynamic"
import { WalletProvider } from "@/contexts/WalletContext"

const WalletConnector = dynamic(() => import("../components/WalletConnector"), { ssr: false })
const UploadWidget = dynamic(() => import("../components/UploadWidget"), { ssr: false })

const WidgetsPage: React.FC = () => {
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

export default WidgetsPage

