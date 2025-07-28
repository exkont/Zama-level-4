import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0x30e9B7C686B1794Ce313712E2f2Ac8719d460332";

    console.log("🧪 Testing deployed FundraisingPlatform contract...");
    console.log("📍 Contract address:", contractAddress);

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer address:", deployer.address);

    // Get contract instance
    const FundraisingPlatform = await ethers.getContractFactory("FundraisingPlatform");
    const contract = FundraisingPlatform.attach(contractAddress);

    try {
        // Check initial state
        console.log("\n📊 Checking initial contract state...");
        const totalCampaigns = await contract.getTotalCampaigns();
        console.log("Total campaigns:", totalCampaigns.toString());

        const activeCampaigns = await contract.getActiveCampaigns();
        console.log("Active campaigns:", activeCampaigns.length);

        // Create a test campaign
        console.log("\n🚀 Creating test campaign...");
        const title = "Помощь Анне Ивановой";
        const description = "Анна нуждается в срочной медицинской помощи для лечения редкого заболевания. Каждое пожертвование важно и поможет спасти жизнь.";
        const targetAmount = ethers.parseEther("2.0"); // 2 ETH target
        const duration = 30 * 24 * 60 * 60; // 30 days

        const createTx = await contract.createCampaign(title, description, targetAmount, duration);
        const receipt = await createTx.wait();

        console.log("✅ Campaign created successfully!");
        console.log("📋 Transaction hash:", receipt?.hash);

        // Get campaign ID from event
        const campaignCreatedEvent = receipt?.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === "CampaignCreated";
            } catch {
                return false;
            }
        });

        let campaignId = 0;
        if (campaignCreatedEvent) {
            const parsed = contract.interface.parseLog(campaignCreatedEvent);
            campaignId = parsed?.args[0];
            console.log("🎯 Campaign ID:", campaignId.toString());
        }

        // Get campaign info
        console.log("\n📖 Campaign details:");
        const campaignInfo = await contract.getCampaignBasicInfo(campaignId);
        console.log("- Creator:", campaignInfo.creator);
        console.log("- Title:", campaignInfo.title);
        console.log("- Description:", campaignInfo.description);
        console.log("- Target Amount:", ethers.formatEther(campaignInfo.targetAmount), "ETH");
        console.log("- Deadline:", new Date(Number(campaignInfo.deadline) * 1000).toLocaleString());
        console.log("- Active:", campaignInfo.active);
        console.log("- Current Amount:", ethers.formatEther(campaignInfo.currentAmount), "ETH");

        // Check progress
        const progress = await contract.getProgressPercentage(campaignId);
        console.log("- Progress:", progress.toString() + "%");

        // Test donation (mock encrypted data for Sepolia)
        console.log("\n💰 Testing donation...");
        const mockEncryptedAmount = "0x" + "0".repeat(64); // Mock encrypted data for Sepolia
        const mockProof = "0x" + "0".repeat(128); // Mock proof for Sepolia
        const donationAmount = ethers.parseEther("0.01"); // Small test donation

        try {
            const donateTx = await contract.donate(campaignId, mockEncryptedAmount, mockProof, {
                value: donationAmount
            });
            const donateReceipt = await donateTx.wait();

            console.log("✅ Donation successful!");
            console.log("📋 Donation tx:", donateReceipt?.hash);

            // Check updated campaign info
            const updatedInfo = await contract.getCampaignBasicInfo(campaignId);
            console.log("- Updated Amount:", ethers.formatEther(updatedInfo.currentAmount), "ETH");

            const updatedProgress = await contract.getProgressPercentage(campaignId);
            console.log("- Updated Progress:", updatedProgress.toString() + "%");

            const donorsCount = await contract.getDonorsCount(campaignId);
            console.log("- Donors Count:", donorsCount.toString());

        } catch (error: any) {
            console.log("❌ Donation failed (expected in Sepolia without real FHE):", error.message);
        }

        console.log("\n✅ Contract testing completed!");
        console.log("🌐 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);

    } catch (error: any) {
        console.error("❌ Error testing contract:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 