const hre = require("hardhat");

async function main() {
  console.log("Deploying CadenceSavings to Base...");

  // USDC token addresses
  const USDC_ADDRESSES = {
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    baseMainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  };

  const network = hre.network.name;
  let usdcAddress;

  if (network === "baseSepolia") {
    usdcAddress = USDC_ADDRESSES.baseSepolia;
    console.log("Deploying to Base Sepolia testnet");
  } else if (network === "baseMainnet") {
    usdcAddress = USDC_ADDRESSES.baseMainnet;
    console.log("Deploying to Base Mainnet");
  } else {
    // Fallback for local testing or other networks if needed, or throw
    console.warn("Network not recognized, defaulting to Base Sepolia USDC for testing");
    usdcAddress = USDC_ADDRESSES.baseSepolia;
  }

  console.log(`Using USDC address: ${usdcAddress}`);

  // Deploy Vault
  const CadenceSavings = await hre.ethers.getContractFactory("CadenceSavings");
  const vault = await CadenceSavings.deploy(usdcAddress);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log(`\n✅ CadenceSavings deployed to: ${vaultAddress}`);
  console.log(`   Network: ${network}`);
  console.log(`   USDC Token: ${usdcAddress}`);

  console.log("\n⏳ Waiting for block confirmations...");
  // Wait fewer blocks for testnets if needed, but 5 is safe
  if (network !== "hardhat" && network !== "localhost") {
    try {
      await vault.deploymentTransaction().wait(5);
    } catch (e) {
      console.log("Wait failed or timed out", e);
    }
  }

  // Verify on Basescan
  if (process.env.BASESCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("\n📝 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [usdcAddress],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\nAdd this to your frontend config:");
  console.log(`VITE_VAULT_ADDRESS=${vaultAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
