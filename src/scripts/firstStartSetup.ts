/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 23/08/2024
 * @updated: 23/08/2024
 * @file firstStartSetup.ts
 * @description: This file will hide the non used elements in the first start of the application.
 */

function hideElements(selector: string): void {
  const element: HTMLElement | null = document.querySelector(selector);
  if (element) {
    element.style.display = "none";
  }
}

function setup(): void {
  hideElements("[preparing-utxos-text]");
  hideElements("[preparing-utxos-doublecheck]");
  hideElements("[buttons-sign-n-submit-wrapper]");
  hideElements("[buttons-inscribe-on-chain-wrapper]");
  hideElements("[tx-submitted-confirmation-in-progress]");
  hideElements("[submissions-inscribed]");
  hideElements("[inscribe-more-wrapper]");
}

setup();
