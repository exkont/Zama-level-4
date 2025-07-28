import { ethers } from "hardhat";

async function main() {
    const CONTRACT_ADDRESS = "0xF523245c7C3af89Ad3b0016F1F931Cb1F7Ea391A";

    const FundraisingPlatform = await ethers.getContractFactory("FundraisingPlatform");
    const contract = FundraisingPlatform.attach(CONTRACT_ADDRESS);

    try {
        const campaigns = await contract.getAllCampaigns();
        console.log("Available campaigns:", campaigns.map((id: any) => id.toString()));

        for (const campaignId of campaigns) {
            const info = await contract.getCampaignBasicInfo(campaignId);
            console.log(`\nCampaign ${campaignId}:`);
            console.log(`- Title: ${info.title}`);
            console.log(`- Target: ${ethers.formatEther(info.targetAmount)} ETH`);
            console.log(`- Active: ${info.active}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 