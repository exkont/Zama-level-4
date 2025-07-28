import { ethers, getNamedAccounts } from "hardhat";

async function main() {
    const { deployer } = await getNamedAccounts();
    console.log("Deployer is:", deployer);

    const balance = await ethers.provider.getBalance(deployer);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch((e) => { console.error(e); process.exit(1); }); 