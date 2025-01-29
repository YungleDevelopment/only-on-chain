import { WalletProvider } from "@/contexts/WalletContext"
import WalletConnector from "@/components/WalletConnector"
import UploadWidget from "@/components/UploadWidget"


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

