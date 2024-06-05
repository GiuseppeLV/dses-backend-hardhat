const { ethers, upgrades } = require("hardhat");
const { INITIAL_SUPPLY } = require("../helper-hardhat-config");

async function main() {
  const INITIAL_SUPPLY=1000000
  accounts = await ethers.getSigners()
        deployer=accounts[0]
  const contract = await ethers.getContractFactory("PollutionToken",deployer);
  const dep = await upgrades.deployProxy(contract, []
  ,{constructorArgs:[1000000, "PollutionToken", "PT"]});
  console.log("Transaction hash: ",dep.deployTransaction.hash);
  await box.waitForDeployment();
  console.log("admin addr:", contract.getAdminAddress(deployer))

  console.log(`DEPLOYED Contract TO THE ADDRESS: ${dep.address}`);
  
}
main();