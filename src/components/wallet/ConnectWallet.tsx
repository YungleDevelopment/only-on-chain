import React from "react";
import { Button } from "../ui/Button";
import { useWallet } from "../../context/WalletContext";
import { WalletMenu } from "./WalletMenu";

export default function ConnectWallet(): React.ReactElement {
  const { openMenu, defaultWallet } = useWallet();

  return (
    <>
      <Button onClick={openMenu} animate={false}>
        {defaultWallet ? `Connected to ${defaultWallet}` : "Connect Wallet"}
      </Button>
    </>
  );
}
