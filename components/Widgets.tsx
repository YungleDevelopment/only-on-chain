"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Image from "next/image";
import Link from "next/link";
import { allSupportedWallets } from "@/types/cardano";
import { useWallet } from "@/contexts/WalletContext";

export const WalletConnector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<
    Record<string, boolean>
  >({});
  const {
    connectedWallets,
    defaultWallet,
    checkWalletInstalled,
    handleConnect,
    makeDefault,
  } = useWallet();

  useEffect(() => {
    const checkInstalledWallets = async () => {
      const installed: Record<string, boolean> = {};
      for (const key of Object.keys(allSupportedWallets)) {
        installed[key] = await checkWalletInstalled(key);
      }
      setInstalledWallets(installed);
    };
    checkInstalledWallets();
  }, [checkWalletInstalled]);

  return (
    <div className="wallet-connector-widget">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-white/90 rounded-full"
      >
        Connect wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-lg text-white border-white/20 h-full p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Connect wallet
            </DialogTitle>
          </DialogHeader>
          {connectedWallets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Connected wallets</h3>
              <div className="space-y-2">
                {connectedWallets.map((walletKey) => (
                  <div
                    key={walletKey}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          allSupportedWallets[walletKey].icon ||
                          "/placeholder.svg"
                        }
                        alt={allSupportedWallets[walletKey].name}
                        width={24}
                        height={24}
                      />
                      <span>{allSupportedWallets[walletKey].name}</span>
                    </div>
                    {defaultWallet !== walletKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => makeDefault(walletKey)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Make default
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {connectedWallets.length
                ? "Select a wallet to install"
                : "Available wallets"}
            </h3>
            <div className="space-y-2">
              {Object.entries(allSupportedWallets)
                .filter(([key]) => !connectedWallets.includes(key))
                .map(([key, wallet]) => {
                  const isInstalled = installedWallets[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={wallet.icon || "/placeholder.svg"}
                          alt={wallet.name}
                          width={24}
                          height={24}
                        />
                        <span>{wallet.name}</span>
                      </div>
                      {isInstalled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConnect(key)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Connect
                        </Button>
                      ) : (
                        <Link
                          href={wallet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Install
                        </Link>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const UploadWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = () => {
    // Implementar lógica de carga aquí
    console.log("Archivo cargado");
  };

  return (
    <div className="upload-widget">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white hover:bg-blue-600 rounded-full"
      >
        Upload File
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <input type="file" className="mb-4" />
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
