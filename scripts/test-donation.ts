import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0x30e9B7C686B1794Ce313712E2f2Ac8719d460332";

    console.log("🧪 Testing donation function with correct FHE parameters...");
    console.log("📍 Contract address:", contractAddress);

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("👤 Donor address:", deployer.address);

    // Get contract instance
    const FundraisingPlatform = await ethers.getContractFactory("FundraisingPlatform");
    const contract = FundraisingPlatform.attach(contractAddress);

    try {
        // Check available campaigns
        console.log("\n📊 Checking available campaigns...");
        const allCampaigns = await contract.getAllCampaigns();
        console.log("Available campaigns:", allCampaigns.map(c => c.toString()));

        if (allCampaigns.length === 0) {
            console.log("❌ No campaigns available for testing");
            return;
        }

        // Use campaign ID 1 (as shown in error message)
        const campaignId = 1;
        console.log(`\n🎯 Testing donation to campaign ${campaignId}...`);

        // Get campaign info first
        const campaignInfo = await contract.getCampaignBasicInfo(campaignId);
        console.log("Campaign details:");
        console.log("- Title:", campaignInfo.title);
        console.log("- Target:", ethers.formatEther(campaignInfo.targetAmount), "ETH");
        console.log("- Active:", campaignInfo.active);
        console.log("- Current:", ethers.formatEther(campaignInfo.currentAmount), "ETH");

        if (!campaignInfo.active) {
            console.log("❌ Campaign is not active");
            return;
        }

        // Test donation with correct parameters
        console.log("\n💰 Making test donation...");

        // Mock FHE data in correct format (bytes32 + bytes)
        const mockEncryptedAmount = ethers.randomBytes(32); // externalEuint64 as bytes32
        const mockProof = ethers.randomBytes(100); // proof as bytes
        const donationAmount = ethers.parseEther("0.01"); // 0.01 ETH

        console.log("- Encrypted amount (bytes32):", ethers.hexlify(mockEncryptedAmount));
        console.log("- Proof length:", mockProof.length, "bytes");
        console.log("- ETH amount:", ethers.formatEther(donationAmount), "ETH");

        // Check donor count before
        const donorsBefore = await contract.getDonorsCount(campaignId);
        console.log("- Donors before:", donorsBefore.toString());

        const tx = await contract.donate(campaignId, mockEncryptedAmount, mockProof, {
            value: donationAmount
        });

        console.log("📋 Transaction submitted:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

        // Check results
        const donorsAfter = await contract.getDonorsCount(campaignId);
        const updatedInfo = await contract.getCampaignBasicInfo(campaignId);
        const progress = await contract.getProgressPercentage(campaignId);

        console.log("\n📊 Results:");
        console.log("- Donors after:", donorsAfter.toString());
        console.log("- Updated amount:", ethers.formatEther(updatedInfo.currentAmount), "ETH");
        console.log("- Progress:", progress.toString() + "%");
        console.log("- Gas used:", receipt?.gasUsed?.toString());

        console.log("\n✅ Donation test completed successfully!");

    } catch (error: any) {
        console.error("❌ Donation test failed:", error.message);

        // Analyze the error
        if (error.message.includes("missing revert data")) {
            console.log("\n🔍 Error analysis:");
            console.log("- This indicates the contract is reverting without a message");
            console.log("- Possible causes:");
            console.log("  1. Campaign ID doesn't exist");
            console.log("  2. Campaign is not active");
            console.log("  3. Insufficient ETH for gas (need >= 0.001 ETH)");
            console.log("  4. FHE operations failing on Sepolia");
        }

        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 