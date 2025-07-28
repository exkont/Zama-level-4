import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    isConnecting: false,
    error: null,
  });

  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          throw new Error("Failed to add Sepolia network");
        }
      } else {
        console.error("Error switching to Sepolia:", switchError);
        throw new Error("Failed to switch to Sepolia network");
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: "MetaMask not installed",
      }));
      return;
    }

    // Handle multiple wallet conflicts
    if (window.ethereum.providers && window.ethereum.providers.length > 0) {
      // Multiple wallets detected, try to find MetaMask
      const metamaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask);
      if (metamaskProvider) {
        window.ethereum = metamaskProvider;
      }
    }

    try {
      setWalletState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      const provider = new ethers.BrowserProvider(window.ethereum);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      setWalletState((prev) => ({
        ...prev,
        account: accounts[0],
        provider,
        signer,
        isConnecting: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }));
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        setWalletState((prev) => ({
          ...prev,
          account: accounts[0].address,
          provider,
          signer,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletState((prev) => ({
            ...prev,
            account: null,
            provider: null,
            signer: null,
          }));
        } else {
          checkConnection();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [checkConnection]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      provider: null,
      signer: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
  };

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
