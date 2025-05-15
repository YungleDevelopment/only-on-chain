/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 23/08/2024
 * @updated: 23/08/2024
 * @file defaultWallet.ts
 * @description: This file containts the logic for the default wallet.
 */

import { CARDANO } from "./wallet";


// Variable that stores the default wallet name
export let DEFAULT_WALLET: string | null =
  localStorage.getItem("defaultWallet");

// Type for the connected wallet
export type TApiConnectedWallet = any;

// Type for the connected wallets
type TonnectedWallets = {
  [key: string]: TApiConnectedWallet;
};

// Object that stores the connected wallets' apis
const connectedWalletsApis: TonnectedWallets = {};

// Function that adds the connected wallet api
export async function addConnectedWalletApi(wallet_name: string) {
  if (CARDANO) {
    const api = await CARDANO[wallet_name].enable();
    connectedWalletsApis[wallet_name] = api;
  }
}

// Function that returns the connected wallet api
export function getConnectedWalletApi(): TApiConnectedWallet {
  if (DEFAULT_WALLET) {
    return connectedWalletsApis[DEFAULT_WALLET];
  } else throw new Error("No default wallet set");
}

// Selector of the button to make default a wallet
const makeDefaultSelector: string = "[connected-wallet-template-make-default]";
// Selector of the active wallet
const activeSelector: string = "connected-wallet-active";

// setter for the default wallet
export function setDefaultWallet(wallet: string, element?: HTMLElement) {
  // set as active in LS and global variable
  localStorage.setItem("defaultWallet", wallet);
  DEFAULT_WALLET = wallet;
  // Search for current active and remove class
  const currentActive = document.querySelector(`.${activeSelector}`);
  if (currentActive) {
    currentActive.classList.remove(activeSelector);
    const makeDefaultElement: HTMLElement | null =
      currentActive.querySelector(makeDefaultSelector);
    if (makeDefaultElement) {
      makeDefaultElement.style.display = "block";
    }
  }
  if (element) {
    element.classList.add(activeSelector);
    const makeDefaultElement: HTMLElement | null =
      element.querySelector(makeDefaultSelector);
    if (makeDefaultElement) {
      makeDefaultElement.style.display = "none";
    }
  }
}
