/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 23/08/2024
 * @updated: 23/08/2024
 * @file wallet.ts
 * @description: This file containts the main logic of the application.
 */

import { CardanoWindow } from "../types/walletTypes";
import { setWalletsInMenu } from "./setWalletsInMenu";

declare global {
  interface Window {
    cardano: CardanoWindow | null;
  }
}

export let CARDANO: CardanoWindow | null;


CARDANO = window.cardano || {};

function main() {
  console.log("Hello from wallet.ts");
  setWalletsInMenu();
}

main();
