const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying CarbonCredit contract to network:", hre.network.name);

  // Load contract
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");

  // Deploy
  const carbonCredit = await CarbonCredit.deploy();
  await carbonCredit.waitForDeployment();

  // Get deployed address
  const contractAddress = await carbonCredit.getAddress();
  console.log("✅ Contract deployed at:", contractAddress);

  // Save ABI
  const abi = carbonCredit.interface.formatJson();
  fs.writeFileSync("CarbonCreditABI.json", abi);
  console.log("💾 ABI saved to CarbonCreditABI.json");

  console.log("\n🎉 Deployment successful!");
  console.log("⚠️ Remember to save your contract address for frontend/backend integration.\n");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
