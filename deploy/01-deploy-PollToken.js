const { network, upgrades, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
  saveDeploy
} = require("../helper-hardhat-config")
const ethernal = require('hardhat-ethernal');
//const { ethers, upgrades } = require("ethers");
const { verify } = require("../utils/verify")
const fs = require('fs');
require('dotenv').config();
const waitBlockConfirmations = developmentChains.includes(network.name)
? 1
: VERIFICATION_BLOCK_CONFIRMATIONS

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, save } = deployments
  const { deployer } = await getNamedAccounts()
  const INITIAL_SUPPLY = 900000000;
  console.log("deployer:",deployer)
  const chainId = network.config.chainId
  console.log("chainiddeploy:",chainId)
  const arguments= [INITIAL_SUPPLY,"PollutionToken", "PT"]
  let dep;

      let address;
      if(process.env.FIRST_DEPLOY==="true"){
        console.log("mai deployato pt")
      const contract = await ethers.getContractFactory("PollutionToken");
      console.log("DEployeraddres:", deployer.address)
      dep = await upgrades.deployProxy(contract,arguments
      ,{initializer:"initialize"}); 
      await dep.waitForDeployment();
      await saveDeploy(dep,save,'PollutionToken')
      console.log("admin addr:", await dep.getAdminAddress())
      console.log('contract deployed at', await dep.getAddress())

    }
      else{
        const contract = await ethers.getContractFactory("PollutionToken");
        const contractInstance = await ethers.getContract("PollutionToken");
      console.log("stampo pollutiontokenaddress=", await contractInstance.getAddress())
      console.log("sto deployando un reproxy");
      dep = await upgrades.upgradeProxy(
        await contractInstance.getAddress(),
        contract
      );
    
      await dep.waitForDeployment();

      console.log("admin addr:", await dep.getAdminAddress())
      console.log('contract deployed at', await dep.getAddress())

      
  //const { address } = contract;
  /*
  console.log("PROCESS.ENV.DSESCENTERADDRESS", process.env.DSESCENTER_ADDRESS)
  if(process.env.DSESCENTER_ADDRESS !="" || process.env.CITY_ADDRESS!=""){ //if those contract were already deployed once
    const dsesCenterContract = await ethers.getContractAt("contracts/DSESCenter.sol:DSESCenter", process.env.DSESCENTER_ADDRESS);
    console.log("Aggiorno l'address del dsescentercontract con quello del pt", dsesCenterContract)
    console.log("valore address in pt:", await dsesCenterContract.getAdminAddress())
    await dsesCenterContract.updateContractAddress(address)
    const cityContract = await ethers.getContractAt("contracts/City.sol:City", process.env.CITY_ADDRESS);
    await cityContract.updateContractAddress(address) 
  }
*/


  //log(`contract ct deployed at ${contract.getContractAddress()}`)

  //log(`contract pt deployed at ${contract.pt.address}`)
  log("Rete su cui deployo:", network.name)
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Verifying...")
    await verify(await dep.getAddress(), arguments)
  }
}


  
}







module.exports.tags = ["all", "pollutionToken"]
