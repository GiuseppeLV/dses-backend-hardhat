const { ethers, upgrades } = require("hardhat");
async function main() {
  const contract = await ethers.getContractFactory("DSESCenter");
  console.log("Deploying the smart contract");
  const dep = await upgrades.upgradeProxy(
    "0x6E85883FA342D8E025516eE4079c11cA04efF7ea",
    contract
  );

  await dep.deployed();
  console.log(`UPGRADED Storage contract to version 2`,dep.address);
}
main();