"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { allSupportedWallets } from "@/types/cardano";
import { useWallet } from "@/contexts/WalletContext";

export default function WalletConnector() {
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
      for (const walletKey of Object.keys(allSupportedWallets)) {
        installed[walletKey] = await checkWalletInstalled(walletKey);
      }
      setInstalledWallets(installed);
    };
    checkInstalledWallets();
  }, [checkWalletInstalled]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-white/90 rounded-full"
      >
        Connect wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-lg text-white border-white/20 h-full p-6 overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl text-white">
                Connect wallet
              </DialogTitle>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-white"
                onClick={() => setIsOpen(false)}
              >
                X
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              By connecting your wallet you agree to our{" "}
              <Link href="/terms" className="text-blue-400 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
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
                .map(([key, wallet]) => (
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
                    {installedWallets[key] ? (
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
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
