import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../../context/WalletContext";
import { Button } from "../ui/Button";
import { CloseIconSecondary } from "../../icons/CloseIconSecondary";

export function WalletMenu(): React.ReactElement | null {
  const {
    isMenuOpen,
    closeMenu,
    wallets,
    connectedWallets,
    defaultWallet,
    connectWallet,
    disconnectWallet,
    setDefaultWallet,
    installedWallets,
  } = useWallet();

  const availableWallets = Object.entries(wallets).filter(
    ([key, _]) =>
      installedWallets.includes(key) &&
      !connectedWallets.some((w) => w.name.toLowerCase() === key)
  );

  const walletsToInstall = Object.entries(wallets).filter(
    ([key, _]) => !installedWallets.includes(key)
  );

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            className="fixed inset-0  backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/10 backdrop-blur-xl p-6 z-50 text-white overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[2rem] font-medium">Connect wallet</div>
                <Button
                  variant="ghost"
                  className="p-1 hover:bg-white/10 rounded-full"
                  onClick={closeMenu}
                >
                  <CloseIconSecondary className="w-6 h-6" />
                </Button>
              </div>

              <p className="!text-sm !text-light !mb-6">
                By connecting your wallet you agree to our{" "}
                <a href="#" className="!text-light underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="!text-light underline">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="overflow-y-auto flex flex-col gap-8">
                {/* Connected Wallets Section */}
                {connectedWallets.length > 0 && (
                  <div>
                    <div className="text-xl font-medium mb-3">
                      Connected wallets
                    </div>
                    <div className="space-y-2">
                      {connectedWallets.map((connectedWallet) => {
                        const wallet =
                          wallets[connectedWallet.name.toLowerCase()];
                        const isDefault =
                          defaultWallet?.toLowerCase() ===
                          connectedWallet.name.toLowerCase();

                        return (
                          <div
                            key={connectedWallet.name}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                              isDefault ? "bg-blue-500/20" : "bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                <img
                                  src={wallet.icon || "/placeholder.svg"}
                                  alt={wallet.name}
                                  className="w-5 h-5"
                                />
                              </div>
                              <span>{wallet.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isDefault && (
                                <Button
                                  variant="ghost"
                                  className="text-sm hover:bg-white/10"
                                  onClick={() => setDefaultWallet(wallet.name)}
                                >
                                  Make default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                className="text-sm text-red-400 hover:bg-red-500/10 !hidden"
                                onClick={() => disconnectWallet(wallet.name)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Installed but not connected Wallets Section */}
                {availableWallets.length > 0 && (
                  <div>
                    <div className="text-xl font-medium mb-3">
                      Available wallets
                    </div>
                    <div className="space-y-2">
                      {availableWallets.map(([key, wallet]) => (
                        <div
                          key={key}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                              <img
                                src={wallet.icon || "/placeholder.svg"}
                                alt={wallet.name}
                                className="w-5 h-5"
                              />
                            </div>
                            <span>{wallet.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-sm hover:bg-white/10"
                            onClick={() => connectWallet(wallet.name)}
                            successText="Connected"
                          >
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Installed Wallets Section */}
                {walletsToInstall.length > 0 && (
                  <div>
                    <div className="text-xl font-medium mb-3">
                      Select a wallet to install
                    </div>
                    <div className="space-y-2">
                      {walletsToInstall.map(([key, wallet]) => (
                        <div
                          key={key}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                              <img
                                src={wallet.icon || "/placeholder.svg"}
                                alt={wallet.name}
                                className="w-5 h-5"
                              />
                            </div>
                            <span>{wallet.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-sm hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(wallet.url, "_blank");
                            }}
                          >
                            Install
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
