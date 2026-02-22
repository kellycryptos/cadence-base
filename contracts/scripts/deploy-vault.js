const hre = require("hardhat");

async function main() {
    console.log("Deploying CadenceVault to Base...");

    // USDC addresses on Base networks
    const USDC_ADDRESSES = {
        8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet
        84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    };

    const chainId = hre.network.config.chainId;
    const usdcAddress = USDC_ADDRESSES[chainId];

    if (!usdcAddress) {
        throw new Error(`USDC address not configured for chain ID ${chainId}`);
    }

    console.log(`Network: ${hre.network.name} (Chain ID: ${chainId})`);
    console.log(`USDC Address: ${usdcAddress}`);

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Deploy CadenceVault
    console.log("\nDeploying CadenceVault...");
    const CadenceVault = await hre.ethers.getContractFactory("CadenceVault");
    const vault = await CadenceVault.deploy(usdcAddress);

    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    console.log("\n✅ CadenceVault deployed successfully!");
    console.log(`Contract Address: ${vaultAddress}`);
    console.log(`USDC Token: ${usdcAddress}`);

    // Save deployment info
    console.log("\n📝 Deployment Summary:");
    console.log("=".repeat(50));
    console.log(`Network: ${hre.network.name}`);
    console.log(`Chain ID: ${chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`CadenceVault: ${vaultAddress}`);
    console.log(`USDC: ${usdcAddress}`);
    console.log("=".repeat(50));

    console.log("\n⚠️  IMPORTANT: Update your .env file:");
    console.log(`VITE_VAULT_ADDRESS=${vaultAddress}`);

    // Wait for block confirmations before verifying
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("\nWaiting for block confirmations...");
        await vault.deploymentTransaction().wait(5);

        console.log("\nVerifying contract on Basescan...");
        try {
            await hre.run("verify:verify", {
                address: vaultAddress,
                constructorArguments: [usdcAddress],
            });
            console.log("✅ Contract verified on Basescan!");
        } catch (error) {
            console.log("⚠️  Verification failed:", error.message);
            console.log("You can verify manually later with:");
            console.log(`npx hardhat verify --network ${hre.network.name} ${vaultAddress} ${usdcAddress}`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
