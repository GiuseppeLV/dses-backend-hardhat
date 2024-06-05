//require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require('@openzeppelin/hardhat-upgrades');
require("@nomicfoundation/hardhat-chai-matchers");
require('hardhat-ethernal');
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers")
const bip39=require('bip39')

const mnemonic = bip39.generateMnemonic(128);
console.log('Mnemonic:', mnemonic);
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/HuF4Iu2yp2gz30vNPDcBJ9n8e4AJDYjJ"
console.log("SEPOLIA:", SEPOLIA_RPC_URL)
const PRIVATE_KEY = process.env.PRIVATE_KEY
// optional
//const MNEMONIC = process.env.MNEMONIC || "your mnemonic"

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "Your etherscan API key"
const REPORT_GAS = process.env.REPORT_GAS.toLowerCase() === "true" || false
const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY


module.exports = {
  defaultNetwork: "hardhat",
  ethernal: {
    apiToken: process.env.ETHERNAL_API_TOKEN
  },
  networks: {
    hardhat: {
      // // If you want to do some forking, uncomment this
      // forking: {
      //   url: MAINNET_RPC_URL
      // },
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gasPrice: 1000000000,
      gasLimit: 100000
      
    },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true,
      gasPrice: 1000000000,
      gasLimit: 100000

    },
     //SE DEPLOY SU SEPOLIA TOGLILO COMMETNO
    sepolia: {
      accounts:[PRIVATE_KEY],
      url: SEPOLIA_RPC_URL,
      //accounts: {
      //     mnemonic: MNEMONIC,
      // },
      saveDeployments: true,
      chainId: 11155111,
      blockConfirmation: 6,
    },
    

  },
  ganache: {
    url: GANACHE_RPC_URL,
    accounts: [GANACHE_PRIVATE_KEY],
    chainId: 5777,
},
  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "EUR",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token:"ETH"
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      11155111: 0,
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    city: {
      default: 1,
      31337: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },

    state: {
      default:2,
      31337: "0xed5ae0D509424781Ee4C2c98f013e9262046e2Eb",
    },
  },
  mocha: {
    timeout: 100000000,
	},
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.4.24",
      },
      {
        version: "0.8.21",
      },
    ],
   
  },
}
