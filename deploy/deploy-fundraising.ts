import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("Deploying FundraisingPlatform contract...");
    console.log("Deployer address:", deployer);

    const deployed = await deploy("FundraisingPlatform", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: hre.network.name === "hardhat" ? 1 : 2,
    });

    console.log(`✅ FundraisingPlatform deployed at: ${deployed.address}`);
    console.log(`📋 Transaction hash: ${deployed.transactionHash}`);

    if (hre.network.name !== "hardhat") {
        console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${deployed.address}`);
        console.log(`📝 Contract verification may take a few minutes...`);
    }

    // Save deployment info for frontend
    const deploymentInfo = {
        contractAddress: deployed.address,
        network: hre.network.name,
        deployedAt: new Date().toISOString(),
        deployer: deployer,
        transactionHash: deployed.transactionHash
    };

    console.log("\n📊 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return true;
};

export default func;
func.id = "deploy_fundraising_platform";
func.tags = ["FundraisingPlatform"]; 