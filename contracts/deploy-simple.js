const hre = require("hardhat");

async function main() {
  console.log("Deploying CadenceSavingsFactory to Base Sepolia...");

  const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const CadenceSavingsFactory = await hre.ethers.getContractFactory("CadenceSavingsFactory");
  const factory = await CadenceSavingsFactory.deploy(USDC_SEPOLIA);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`\n✅ CadenceSavingsFactory deployed to: ${factoryAddress}`);
  console.log(`   USDC Token: ${USDC_SEPOLIA}`);
  
  console.log("\n🎉 Deployment complete!");
  console.log("\nUpdate frontend with:");
  console.log(`VITE_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
