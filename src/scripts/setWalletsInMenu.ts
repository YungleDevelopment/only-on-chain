/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 23/08/2024
 * @updated: 23/08/2024
 * @file setWalletsInMenu.ts
 * @description: This file containts the logic on rendering the wallet elements in the menu.
 */

import { WalletData } from "../types/walletTypes";
import { allSupportedWallets } from "../utils/supportedWallets";
import { addConnectedWalletApi, DEFAULT_WALLET, setDefaultWallet } from "./defaultWallet";
import { CARDANO } from "./wallet";

function checkForDefaultWallet(wallet: string) {
  if (!DEFAULT_WALLET) {
    setDefaultWallet(wallet);
  }
}

/**
 * This function sets the wallets in the menu
 */

export async function setWalletsInMenu() {
  const wallets = Object.keys(CARDANO || {});
  console.log(wallets);
  const walletTemplate = document.querySelector(
    "[connected-wallet-template]"
  ) as HTMLElement;
  const missingWalletTemplate = document.querySelector(
    "[missing-wallet-template]"
  ) as HTMLElement;
  const walletAvailableList = document.querySelector(
    "[wallet-available-list]"
  ) as HTMLElement;
  const missingWalletList = document.querySelector(
    "[missing-wallet-list]"
  ) as HTMLElement;
  const noConnectedWalletElement = document.querySelector(
    "[connected-wallet-none]"
  ) as HTMLElement;
  let hasConnectedWallets = false;

  for (const wallet in allSupportedWallets) {
    const walletElement = walletTemplate.cloneNode(true) as HTMLElement;
    const walletName = wallet.charAt(0).toUpperCase() + wallet.slice(1);
    const walletData: WalletData = allSupportedWallets[wallet];

    if (CARDANO && wallets.includes(wallet)) {
      if (await CARDANO[wallet].isEnabled()) {
        checkForDefaultWallet(wallet);
        addConnectedWalletApi(wallet);
        // Put wallet in the enabled wallets list
        (
          walletElement.querySelector(
            "[connected-wallet-template-name]"
          ) as HTMLElement
        ).innerText = walletName;
        (
          walletElement.querySelector(
            "[connected-wallet-template-icon]"
          ) as HTMLImageElement
        ).src = CARDANO[wallet].icon;
        if (wallet === DEFAULT_WALLET) {
          walletElement.classList.add("connected-wallet-active");
          (
            walletElement.querySelector(
              "[connected-wallet-template-make-default]"
            ) as HTMLElement
          ).style.display = "none";
        }
        walletElement
          .querySelector("[connected-wallet-template-make-default]")
          ?.addEventListener("click", () => {
            setDefaultWallet(wallet, walletElement);
          });
        walletAvailableList.appendChild(walletElement);
        hasConnectedWallets = true;

        // If no default wallet is set, set the first one as default
        if (!DEFAULT_WALLET) {
          localStorage.setItem("defaultWallet", wallet);
          setDefaultWallet(wallet);
        }
      } else {
        const missingWalletElement = missingWalletTemplate.cloneNode(
          true
        ) as HTMLElement;
        (
          missingWalletElement.querySelector(
            "[missing-wallet-template-name]"
          ) as HTMLElement
        ).innerText = walletName;
        (
          missingWalletElement.querySelector(
            "[missing-wallet-template-icon]"
          ) as HTMLImageElement
        ).src = CARDANO[wallet].icon;

        missingWalletElement
          .querySelector("[missing-wallet-enable]")!
          .addEventListener("click", async () => {
            await CARDANO![wallet].enable();
            location.reload();
          });
        missingWalletElement.querySelector("[missing-wallet-url]")!.remove();
        missingWalletList.appendChild(missingWalletElement);
      }
    } else {
      const missingWalletElement = missingWalletTemplate.cloneNode(
        true
      ) as HTMLElement;
      (
        missingWalletElement.querySelector(
          "[missing-wallet-template-name]"
        ) as HTMLElement
      ).innerText = walletName;
      (
        missingWalletElement.querySelector(
          "[missing-wallet-template-icon]"
        ) as HTMLImageElement
      ).src = walletData.icon;

      missingWalletElement
        .querySelector("[missing-wallet-url]")!
        .setAttribute("href", walletData.url!);
      missingWalletElement.querySelector("[missing-wallet-enable]")?.remove();
      missingWalletList.appendChild(missingWalletElement);
    }
  }

  if (!hasConnectedWallets) {
    noConnectedWalletElement.style.display = "block";
  } else {
    noConnectedWalletElement.style.display = "none";
  }

  walletTemplate.remove();
  missingWalletTemplate.remove();
}
