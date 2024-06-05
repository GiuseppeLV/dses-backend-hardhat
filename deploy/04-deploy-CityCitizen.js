
const { network, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
  saveDeploy
} = require("../helper-hardhat-config")
const ethernal = require('hardhat-ethernal');
const { Network } = require("ethers");
require('dotenv').config();
const fs = require('fs');
const { verify } = require("../utils/verify")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log,save } = deployments
    const { deployer } = await getNamedAccounts()
   
    console.log("deployer:",deployer)
    const chainId = network.config.chainId
    console.log("chainiddeploy:",chainId)

 
    const ptContractAddress = await (await ethers.getContract("PollutionToken")).getAddress();
    const DSESCenterContractAddress = await (await ethers.getContract("DSESCenter")).getAddress();
    console.log('Il contratto pollution è stato deployato:', ptContractAddress)
    /*
    const contract = await deploy("City", {
      from: deployer,// solo reti locali
      //from: "0071a7e04e1595aafceae34506dccf942ae0912ea587f1451b89c2771fd70beb",
      args: [ptContractAddress,DSESCenterContractAddress],
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: network.config.blockConfirmations || 1,
    })
  */
    let address;
    let dep;
    const pollnftAddress=await (await ethers.getContract("PollutionNft")).getAddress();
    const arguments=[ptContractAddress, DSESCenterContractAddress,pollnftAddress]
    if(process.env.FIRST_DEPLOY==="true"){
    const contract = await ethers.getContractFactory("CityCitizen");

 

    dep = await upgrades.deployProxy(contract, arguments
    ,{initializer:"initialize"}); 

    await dep.waitForDeployment();
    await saveDeploy(dep,save,'CityCitizen');


    console.log("admin addr:", await dep.getAdminAddress())
    console.log('contract city deployed at', await dep.getAddress())
    log(`contract deployed at ${contract.address}`)
    log(`contract deployed at ${contract.name}`)
    //log(`contract ct deployed at ${contract.getContractAddress()}`)
  
    //log(`contract pt deployed at ${contract.pt.address}`)
    log("Rete su cui deployo:", network.name)
    
  }
  else{
    const contract = await ethers.getContractFactory("CityCitizen");
    const contractInstance = await ethers.getContract("CityCitizen");

    dep = await upgrades.upgradeProxy(
      await contractInstance.getAddress(),
      contract
    );
  
    await dep.waitForDeployment();
    await saveDeploy(dep,save,'CityCitizen');


  }

  
    if (
      !developmentChains.includes(network.name) &&
      process.env.ETHERSCAN_API_KEY
    ) {
      console.log("Verifying...")
      await verify(await dep.getAddress(), arguments)
    }
    
  }
  
  async function addressSaved(address) {
    let envFile = fs.readFileSync('.env', 'utf8');
  
    const updatedEnvFile = envFile.replace(/CITY_CITIZEN_ADDRESS=.*/, `CITY_CITIZEN_ADDRESS=${address}`);
    
    fs.writeFileSync('.env', updatedEnvFile);
    console.log(`Il valore di CITY_ADDRESS nel file .env è stato aggiornato a ${address}`);
  }
  module.exports.tags = ["all","cityCitizen"]
  