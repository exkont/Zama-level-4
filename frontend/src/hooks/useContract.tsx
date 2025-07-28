import { useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_CONFIG } from "../config/contract";

// Always-FHE contract with honest implementation and fallback support
const CONTRACT_ADDRESS = CONTRACT_CONFIG.ADDRESS;

// ABI for the corrected FHE contract
const CONTRACT_ABI = [
  "function createCampaign(string memory _title, string memory _description, uint256 _targetAmount, uint256 _duration) external returns (uint256)",
  "function donate(uint256 _campaignId, bytes32 _encryptedAmount, bytes calldata _proof) external payable",
  "function getCampaignBasicInfo(uint256 _campaignId) external view returns (address creator, string memory title, string memory description, uint256 targetAmount, uint256 deadline, bool active, uint256 currentAmount)",
  "function getProgressPercentage(uint256 _campaignId) external view returns (uint256)",
  "function getAllCampaigns() external view returns (uint256[] memory)",
  "function getTotalCampaigns() external view returns (uint256)",
  "function getActiveCampaigns() external view returns (uint256[] memory)",
  "function getDonorsCount(uint256 _campaignId) external view returns (uint256)",
  "function getDonationAmount(uint256 _campaignId, address _donor) external view returns (bytes32)",
  "function endCampaign(uint256 _campaignId) external",
  "function withdrawFunds(uint256 _campaignId) external",
  "function isCampaignInitialized(uint256 _campaignId) external view returns (bool)",
  "function getEncryptedTotalRaised(uint256 _campaignId) external view returns (bytes32)",
  "function getCampaignBalance(uint256 _campaignId) external view returns (uint256)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)",
  "event DonationMade(uint256 indexed campaignId, address indexed donor)",
];

export const useContract = () => {
  const { signer, provider } = useWallet();

  const getContract = useCallback(() => {
    if (!signer || !CONTRACT_ADDRESS) {
      throw new Error("Wallet not connected or contract address not set");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [signer]);

  const getReadOnlyContract = useCallback(() => {
    if (!CONTRACT_ADDRESS) {
      throw new Error("Contract address not set");
    }

    // Use public Sepolia RPC for read-only operations, fallback to wallet provider
    let readProvider;
    if (provider) {
      readProvider = provider;
    } else {
      // Fallback to public Sepolia RPC - using Alchemy instead of Infura
      readProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
    }

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
  }, [provider]);

  const createCampaign = useCallback(
    async (title: string, description: string, targetAmount: string, duration: number): Promise<number> => {
      try {
        const contract = getContract();
        const tx = await contract.createCampaign(title, description, targetAmount, duration);
        const receipt = await tx.wait();

        const event = receipt.logs?.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog?.name === "CampaignCreated";
          } catch {
            return false;
          }
        });

        if (event) {
          const parsedLog = contract.interface.parseLog(event);
          return Number(parsedLog?.args?.campaignId || 0);
        }

        return 0;
      } catch (error: any) {
        console.error("Error creating campaign:", error);
        throw new Error(`Failed to create campaign: ${error.message}`);
      }
    },
    [getContract],
  );

  const donate = useCallback(
    async (campaignId: number, amount: string): Promise<void> => {
      try {
        const contract = getContract();

        // For testing on Sepolia, use mock data in correct format
        // externalEuint64 is bytes32, not tuple
        const mockEncryptedAmount = ethers.randomBytes(32); // bytes32 for externalEuint64
        const mockProof = ethers.randomBytes(100); // bytes for proof

        // Use exact amount entered by user
        const donationAmount = BigInt(amount);

        // Check minimum for gas coverage (but don't replace amount!)
        const minGasAmount = ethers.parseEther("0.001");
        if (donationAmount < minGasAmount) {
          throw new Error(
            `Minimum donation amount is 0.001 ETH to cover gas costs. You entered: ${ethers.formatEther(donationAmount)} ETH`,
          );
        }

        const tx = await contract.donate(campaignId, mockEncryptedAmount, mockProof, {
          value: donationAmount,
        });

        await tx.wait();
      } catch (error: any) {
        console.error("Error making donation:", error);

        // More detailed error handling
        if (error.message.includes("revert data")) {
          throw new Error(
            "Transaction failed. Please check that the campaign is active and you have sufficient ETH for gas.",
          );
        }

        if (error.message.includes("Minimum ETH for gas required")) {
          throw new Error("Please send at least 0.001 ETH to cover gas costs.");
        }

        throw new Error(`Failed to make donation: ${error.message}`);
      }
    },
    [getContract],
  );

  const getCampaignBasicInfo = useCallback(
    async (campaignId: number) => {
      try {
        const contract = getReadOnlyContract();
        return await contract.getCampaignBasicInfo(campaignId);
      } catch (error: any) {
        console.error("Error getting campaign info:", error);
        throw new Error(`Failed to get campaign info: ${error.message}`);
      }
    },
    [getReadOnlyContract],
  );

  const getProgressPercentage = useCallback(
    async (campaignId: number): Promise<number> => {
      try {
        const contract = getReadOnlyContract();
        const percentage = await contract.getProgressPercentage(campaignId);
        return Number(percentage);
      } catch (error: any) {
        console.error("Error getting progress:", error);
        throw new Error(`Failed to get progress: ${error.message}`);
      }
    },
    [getReadOnlyContract],
  );

  const getAllCampaigns = useCallback(async (): Promise<number[]> => {
    try {
      const contract = getReadOnlyContract();
      const campaigns = await contract.getAllCampaigns();
      return campaigns.map((id: any) => Number(id));
    } catch (error: any) {
      console.error("Error getting all campaigns:", error);
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }, [getReadOnlyContract]);

  const getTotalCampaigns = useCallback(async (): Promise<number> => {
    try {
      const contract = getReadOnlyContract();
      const total = await contract.getTotalCampaigns();
      return Number(total);
    } catch (error: any) {
      console.error("Error getting total campaigns:", error);
      throw new Error(`Failed to get total campaigns: ${error.message}`);
    }
  }, [getReadOnlyContract]);

  const getDonorsCount = useCallback(
    async (campaignId: number): Promise<number> => {
      try {
        const contract = getReadOnlyContract();
        const count = await contract.getDonorsCount(campaignId);
        return Number(count);
      } catch (error: any) {
        console.error("Error getting donors count:", error);
        return 0;
      }
    },
    [getReadOnlyContract],
  );

  const getActiveCampaigns = useCallback(async (): Promise<number[]> => {
    try {
      const contract = getReadOnlyContract();
      const campaigns = await contract.getActiveCampaigns();
      return campaigns.map((id: any) => Number(id));
    } catch (error: any) {
      console.error("Error getting active campaigns:", error);
      throw new Error(`Failed to get active campaigns: ${error.message}`);
    }
  }, [getReadOnlyContract]);

  const closeCampaign = useCallback(
    async (campaignId: number): Promise<void> => {
      try {
        const contract = getContract();
        const tx = await contract.endCampaign(campaignId);
        await tx.wait();
      } catch (error: any) {
        console.error("Error closing campaign:", error);
        throw new Error(`Failed to close campaign: ${error.message}`);
      }
    },
    [getContract],
  );

  return {
    contractAddress: CONTRACT_ADDRESS,
    createCampaign,
    donate,
    closeCampaign,
    getCampaignBasicInfo,
    getProgressPercentage,
    getAllCampaigns,
    getActiveCampaigns,
    getTotalCampaigns,
    getDonorsCount,
  };
};
