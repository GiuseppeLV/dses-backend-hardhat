const { network, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
  saveDeploy
} = require("../helper-hardhat-config")
const ethernal = require('hardhat-ethernal');
//const { Network, EtherscanProvider } = require("ethers");
const { verify } = require("../utils/verify")
require('dotenv').config();
const fs = require('fs');
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log,save } = deployments
  const { deployer } = await getNamedAccounts()
 
  console.log("deployer:",deployer)
  const chainId = network.config.chainId
  const ptContractAddress = await (await ethers.getContract("PollutionToken")).getAddress();

let address;
let dep;

    if(process.env.FIRST_DEPLOY==="true"){ //if it was never deployed
      console.log("First deploy dsesCenter")
      const contract = await ethers.getContractFactory("DSESCenter");
      dep = await upgrades.deployProxy(contract, [ptContractAddress]
      ,{initializer:"initialize"}); 

      await dep.waitForDeployment();
      await saveDeploy(dep,save,'DSESCenter');

    
      console.log('contract deployed at', await dep.getAddress())
      console.log("contratto di pt:", await dep.getContractAddress());

 
    }
    else{
      console.log("Reproxying dsesCenter...");
      const contract = await ethers.getContractFactory("DSESCenter");
      const contractInstance = await ethers.getContract("DSESCenter");
  
      dep = await upgrades.upgradeProxy(
        await contractInstance.getAddress(),
        contract
      );
      
      await dep.waitForDeployment();
      await saveDeploy(dep,save,'DSESCenter');


      console.log('contract deployed at', await dep.getAddress())
      console.log("pt contract:", await dep.getContractAddress());
      //console.log("CONTRATTO DI DSES CHE CHIAMA UNA FUNZIONE IN PT:", await dep.getContractAddressThisInPt())


    
    }

    
  //const { address } = contract;
  /*
  if(process.env.CITY_ADDRESS!=""){ //if those contract were already deployed once
    console.log("Aggiorno l'address del dsescentercontract con quello del city", address)
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
    await verify(dep.getAddress(), [ptContractAddress])
  }
  
}



module.exports.tags = ["all", "dsesCenter"]
