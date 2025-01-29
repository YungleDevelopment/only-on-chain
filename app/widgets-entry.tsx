import dynamic from "next/dynamic";
import { WalletProvider } from "@/contexts/WalletContext";

const WalletConnector = dynamic(
  () => import("@/components/Widgets").then((mod) => mod.WalletConnector),
  {
    ssr: false,
  }
);
const UploadWidget = dynamic(
  () => import("@/components/Widgets").then((mod) => mod.UploadWidget),
  {
    ssr: false,
  }
);

function WidgetsPage() {
  return (
    <WalletProvider>
      <div id="wallet-connector-container">
        <WalletConnector />
      </div>
      <div id="upload-widget-container">
        <UploadWidget />
      </div>
    </WalletProvider>
  );
}

// Export for direct usage
export { WidgetsPage };

// Also expose globally for script tag usage
if (typeof window !== "undefined") {
  (window as typeof window & { WidgetsPage: typeof WidgetsPage }).WidgetsPage = WidgetsPage;
}

export default WidgetsPage;
