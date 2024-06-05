const { network,ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { Wallet } = require("ethers")
const { verify } = require("../utils/verify")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const signers=await ethers.getSigners()
    console.log("ACCOUNTS:", deployer)
    console.log("SIGNERS:",signers[24])
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const ptContractAddress = await (await ethers.getContract("PollutionToken")).getAddress();
    const arguments = [ptContractAddress];
    if (!ethers.isAddress(deployer)) {
        console.error("Invalid Ethereum address");
        return;
    }
    const provider = ethers.provider;
    console.log("PROVIDER:",provider)

    const tradeToken = await deploy("TradeToken", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log("PTtest:", tradeToken.address,"-", developmentChains.includes(network.name),"-",process.env.ETHERSCAN_API_KEY)
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(tradeToken.address, arguments)
    }
    log("----------------------------------------------------")
    
}

module.exports.tags = ["all", "tradeToken"]