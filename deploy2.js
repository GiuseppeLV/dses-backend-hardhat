//const ethers = require("ethers")
// const solc = require("solc")
const fs = require("fs-extra")
require("dotenv").config()
const { ethers } = require("hardhat")
const { network } = require("hardhat")



//const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const recipientAddress = "0x4d48e5663da01EaC1A7F79F7F56F8516167a47ed";

const amount = ethers.parseEther("0.09");


// Indirizzo del contratto e ABI
//const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; pollutiontoken sepolia
//const contractAddress = "0x88a65fFe6e8fdad141669C473E86ccFE7B8a2bA2"; nel localhost
//const contractAddress="0xe161F3848dEd3389937d2Fe6Ce0C7Dd7f9D36192" //ChainlinkTools sepolia
//const contractAddress="0x79913C46Ed94a7eeAcF8480a1bD3327532975532";//con 1 e 0 e value separati
const contractAddress="0x7B66a3b0a0A8371d7F3d0dEc6D458be476566f48"; //con 1,0,value
                       
// Leggi il contenuto del file JSON
const abi =[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "ChainlinkCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "ChainlinkFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "ChainlinkRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      }
    ],
    "name": "RequestPopulation",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "RequestPopulationData",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "balanceof",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_requestId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_volume",
        "type": "uint256"
      }
    ],
    "name": "fulfill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "volume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawLink",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const signer = wallet.connect(provider);
// Creare l'istanza del contratto
const contract = new ethers.Contract(contractAddress, abi, signer);
async function requestPopulation() {
    let bo=await contract.balanceof();    // Effettua la chiamata alla funzione del contratto per richiedere i dati
    console.log("bilancio del mittente:",bo)


   
    await contract.RequestPopulationData();
    console.log("In attesa della conferma della transazione...");
   // const receipt = await provider.waitForTransaction(transactionHash);

    await new Promise(resolve => setTimeout(resolve, 15000)); // Aspetta 60 secondi
    console.log("In attesa dell'elaborazione della richiesta...");
    // Leggi il valore della popolazione dalla variabile di stato del contratto
    const volume= await contract.volume();
    console.log("Popolazione per il paese",volume);

}
requestPopulation()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})



