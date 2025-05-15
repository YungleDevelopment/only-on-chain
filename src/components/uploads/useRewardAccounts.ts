import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";

export function useRewardAccounts() {
  const [rewardAccounts, setRewardAccounts] = useState<string[]>([]);
  const { defaultWallet, getWalletApi, connectedWallets } = useWallet();

  useEffect(() => {
    const fetchRewardAccounts = async () => {
      try {
        if (!connectedWallets.length || !defaultWallet) return;
        const api = getWalletApi(defaultWallet);
        if (!api) throw new Error("Wallet API not found");
        const rewardAddresses = await api.getRewardAddresses();
        setRewardAccounts(rewardAddresses);
      } catch (err) {
        console.error("Error fetching reward accounts:", err);
      }
    };
    if (connectedWallets.length > 0) fetchRewardAccounts();
  }, [defaultWallet, connectedWallets, getWalletApi]);

  return rewardAccounts;
}
