import { ethers } from "hardhat";

async function main() {
    console.log("Creating second test campaign...");

    const CONTRACT_ADDRESS = "0xF523245c7C3af89Ad3b0016F1F931Cb1F7Ea391A";

    const FundraisingPlatform = await ethers.getContractFactory("FundraisingPlatform");
    const contract = FundraisingPlatform.attach(CONTRACT_ADDRESS);

    const title = "Emergency Surgery for John";
    const description = "John is a 45-year-old construction worker who suffered a severe accident at work. He needs immediate surgery and rehabilitation. His family cannot afford the medical bills and insurance doesn't cover everything.";
    const targetAmount = ethers.parseEther("3.5"); // 3.5 ETH target
    const duration = 45 * 24 * 60 * 60; // 45 days

    try {
        const tx = await contract.createCampaign(title, description, targetAmount, duration);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Second campaign created successfully!");
        console.log("Gas used:", receipt?.gasUsed?.toString());

        // Get total campaigns count
        const allCampaigns = await contract.getAllCampaigns();
        console.log("Total campaigns now:", allCampaigns.length);

    } catch (error) {
        console.error("Error creating campaign:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 