const { network, ethers } = require("hardhat")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { Wallet } = require("ethers")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const signers = await ethers.getSigners()
    console.log("ACCOUNTS:", deployer)
    console.log("SIGNERS:", signers[24])
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const svgind1 =
        '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="green">'
    const svgind2 =
        '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="black">'
    const svgcit1 =
        '<svg width="520" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" style="fill:rgb(255,0,0);stroke-width:8;stroke:green" /><text x="50%" y="110" font-family="Arial Black" font-weight="bold" font-size="20" dominant-baseline="middle" text-anchor="middle" fill="Green">Level 0</text><text x="50%" y="50%" font-family="Arial" font-size="20" dominant-baseline="middle" text-anchor="middle" fill="yellow">'

    const svgcit2 =
        '<svg width="520" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" style="fill:rgb(0,255,0);stroke-width:8;stroke:green" /><text x="50%" y="110" font-family="Arial Black" font-weight="bold" font-size="20" dominant-baseline="middle" text-anchor="middle" fill="Green">Level 1</text><text x="50%" y="50%" font-family="Arial" font-size="20" dominant-baseline="middle" text-anchor="middle" fill="red">'
    let svgind = [svgind1, svgind2]
    let svgcit = [svgcit1, svgcit2]
    const arguments = [svgind, svgcit]
    if (!ethers.isAddress(deployer)) {
        console.error("Invalid Ethereum address")
        return
    }
    const provider = ethers.provider
    console.log("PROVIDER:", provider)

    const pollutionNft = await deploy("PollutionNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    console.log(
        "PTtest:",
        pollutionNft.address,
        "-",
        developmentChains.includes(network.name),
        "-",
        process.env.ETHERSCAN_API_KEY,
    )
    // Verify the deployment
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(pollutionNft.address, arguments)
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "pollutionNft"]
