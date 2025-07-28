import { ethers } from "hardhat";

async function main() {
    console.log("Creating test campaign in FHE contract...");

    // Updated FHE contract address with fixed donation function
    const CONTRACT_ADDRESS = "0xD3930770D9091126B9c0E5715118AB1143BA2517";

    // Get contract instance
    const FundraisingPlatform = await ethers.getContractFactory("FundraisingPlatform");
    const contract = FundraisingPlatform.attach(CONTRACT_ADDRESS);

    // Campaign details
    const title = "Help Maria's Cancer Treatment - FHE Protected";
    const description = "Maria, a young mother of two, has been diagnosed with cancer and needs urgent treatment. The medical expenses are overwhelming for her family. This campaign uses Zama FHE technology to protect donor privacy while maintaining transparency.";
    const targetAmount = ethers.parseEther("2.0"); // 2 ETH target
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds

    try {
        console.log("Creating campaign with FHE protection...");
        const tx = await contract.createCampaign(title, description, targetAmount, duration);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("✅ Campaign created successfully!");
        console.log("Gas used:", receipt.gasUsed.toString());

        // Extract campaign ID from events
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
            const campaignId = parsedLog?.args?.campaignId;
            console.log("📋 Campaign ID:", campaignId.toString());

            // Get campaign info
            const campaignInfo = await contract.getCampaignBasicInfo(campaignId);
            console.log("📊 Campaign Info:");
            console.log("  - Creator:", campaignInfo.creator);
            console.log("  - Title:", campaignInfo.title);
            console.log("  - Target:", ethers.formatEther(campaignInfo.targetAmount), "ETH");
            console.log("  - Deadline:", new Date(Number(campaignInfo.deadline) * 1000).toLocaleString());
            console.log("  - Active:", campaignInfo.active);

            // Check if FHE is initialized
            const isInitialized = await contract.isCampaignInitialized(campaignId);
            console.log("  - FHE Initialized:", isInitialized);
        }

        console.log("\n🔒 This campaign uses Zama FHE technology for donation privacy!");
        console.log("💡 Note: Full FHE functionality requires fhEVM network, but contract structure is demonstrated on Sepolia");

    } catch (error: any) {
        console.error("❌ Error creating campaign:", error.message);

        if (error.message.includes("insufficient funds")) {
            console.log("💰 Please ensure you have enough Sepolia ETH for gas fees");
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 