import React from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import "./styles.css";
import MainUploader from "./components/uploader/mainUploader";
import ConnectWallet from "./components/wallet/ConnectWallet";
import { WalletProvider } from "./context/WalletContext";
import { FileUploadProvider } from "./context/FileUploadContext";
import { TxPreparationProvider } from "./context/TxPreparationContext";
import { TxInscriptionProvider } from "./context/TxInscriptionContext";
import { TxStatusProvider } from "./context/TxStatusContext";
import { WalletMenu } from "./components/wallet/WalletMenu";
import { ENVIRONMENT } from "./utils/apiConsumption";
import HexDecoder from "./components/decoder/HexDecoder";
import Uploads from "./components/uploads/uploads";

const App: React.FC = (): React.ReactElement => {
  return <MainUploader />;
};

const ConnectWalletApp: React.FC = (): React.ReactElement => {
  return <ConnectWallet />;
};

// Self-executing function that works whether DOM is already loaded or not
(function () {
  const currentExecutingEnvironment =
    window.location.host.includes("webflow.io") ||
    window.location.host.includes("localhost")
      ? "preproduction"
      : "production";
  if (currentExecutingEnvironment !== ENVIRONMENT) {
    /* console.error(`Mismatched environment: Expected ${ENVIRONMENT}, found ${currentExecutingEnvironment}`); */
    console.warn(
      `YOU ARE WORKING IN ${currentExecutingEnvironment} ENVIRONMENT`
    );
    return;
  }

  console.log("HELLO THERE FROM PREPROD");

  const renderApp = () => {
    const rootElement = document.getElementById("react-target");
    const connectWalletElement = document.getElementById("connect-wallet");
    //const inscriptorElement = document.getElementById("inscriptor-root");
    const decoderElement = document.getElementById("decoder");
    console.log("decoderElement", decoderElement);
    /**
     * HTML element where the <Uploads /> component will be rendered.
     * This element should have an id of "uploads" and should be present in the
     * HTML document.
     */

    const uploadsElement = document.getElementById("uploads");
    console.log("uploadsElement", uploadsElement);

    if (rootElement /* && inscriptorElement */) {
      const root = ReactDOM.createRoot(rootElement);
      console.log("React target element found");
      console.log("Connect wallet element found");

      root.render(
        <React.StrictMode>
          <WalletProvider>
            <TxStatusProvider>
              <FileUploadProvider>
                <TxPreparationProvider>
                  <TxInscriptionProvider>
                    {connectWalletElement &&
                      createPortal(<ConnectWalletApp />, connectWalletElement)}
                    {rootElement && createPortal(<App />, rootElement)}
                    {document.body && createPortal(<WalletMenu />, document.body)}
                    {uploadsElement &&
                      createPortal(<Uploads />, uploadsElement)}
                    {decoderElement &&
                      createPortal(<HexDecoder />, decoderElement)}
                    {/* {createPortal(<MaiqnInscriptor />, inscriptorElement)} */}
                  </TxInscriptionProvider>
                </TxPreparationProvider>
              </FileUploadProvider>
            </TxStatusProvider>
          </WalletProvider>
        </React.StrictMode>
      );
    }
  };

  // Check if DOM is already loaded
  if (document.readyState === "loading") {
    // If not loaded yet, wait for DOMContentLoaded
    document.addEventListener("DOMContentLoaded", renderApp);
  } else {
    // If already loaded, run immediately
    renderApp();
  }
})();
