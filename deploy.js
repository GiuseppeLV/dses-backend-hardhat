//const ethers = require("ethers")
// const solc = require("solc")
const fs = require("fs-extra")
require("dotenv").config()
const { ethers } = require("hardhat")
const { network } = require("hardhat")



const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
//const recipientAddress = "0x4d48e5663da01EaC1A7F79F7F56F8516167a47ed";
const amount = ethers.parseEther("0.09");


// Indirizzo del contratto e ABI
const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
//const contractAddress = "0x88a65fFe6e8fdad141669C473E86ccFE7B8a2bA2";


// Leggi il contenuto del file JSON
const abi = fs.readFileSync("./abi/_PollutionToken_sol_ContrERC20.abi", "utf8")
    const binary = fs.readFileSync(
        "abi/_PollutionToken_sol_ContrERC20.bin",
        "utf8"
    )



// Provider
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
//const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const signer = wallet.connect(provider);
// Creare l'istanza del contratto
const contract = new ethers.Contract(contractAddress, abi, signer);

// Eseguire la transazione
async function main() {
    // Effettuare il trasferimento
    try {
        const tx = await contract.transfer(recipientAddress, amount);
        const balance= await contract.balanceOf(recipientAddress);
        console.log("Transaction hash:", tx.hash);
        console.log("Rete su cui faccio transazione:",network.name)
        console.log("Rete chainid:",network.config.chainId)
        console.log("balanceof recipient:", balance);
        await tx.wait();
        console.log("Transaction confirmed");
    } catch (error) {
        console.error("Transaction error:", error);
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })