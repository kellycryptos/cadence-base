const hre = require("hardhat");

async function main() {
  console.log("Deploying CadenceSavingsFactory to Base...");

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
    throw new Error("Unsupported network. Use baseSepolia or baseMainnet");
  }

  console.log(`Using USDC address: ${usdcAddress}`);

  // Deploy Factory
  const CadenceSavingsFactory = await hre.ethers.getContractFactory("CadenceSavingsFactory");
  const factory = await CadenceSavingsFactory.deploy(usdcAddress);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`\n✅ CadenceSavingsFactory deployed to: ${factoryAddress}`);
  console.log(`   Network: ${network}`);
  console.log(`   USDC Token: ${usdcAddress}`);
  
  console.log("\n⏳ Waiting for block confirmations...");
  await factory.deploymentTransaction().wait(5);

  // Verify on Basescan
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n📝 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [usdcAddress],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\nAdd this to your frontend config:");
  console.log(`VITE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`VITE_USDC_ADDRESS=${usdcAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
