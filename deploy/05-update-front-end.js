const {
    frontEndContractsAddressLocation,
    frontEndAbiLocation
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network, ethers } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const dsesCenter = await ethers.getContract("DSESCenter")
    fs.writeFileSync(
        `${frontEndAbiLocation}DSESCenter.json`,
        dsesCenter.interface.formatJson()
    )
    const cityCitizen = await ethers.getContract("CityCitizen")
    fs.writeFileSync(
        `${frontEndAbiLocation}CityCitizen.json`,
        cityCitizen.interface.formatJson()
    )
/*
    const cityIndustry = await ethers.getContract("CityIndustry")
    fs.writeFileSync(
        `${frontEndAbiLocation}CityIndustry.json`,
        cityIndustry.interface.formatJson()
    )
    */
    const pollutionToken = await ethers.getContract("PollutionToken")
    fs.writeFileSync(
        `${frontEndAbiLocation}PollutionToken.json`,
        pollutionToken.interface.formatJson()
    )
    const pollutionNft = await ethers.getContract("PollutionNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}PollutionNft.json`,
        pollutionNft.interface.formatJson()
    )

    const tradeToken = await ethers.getContract("TradeToken")
    fs.writeFileSync(
        `${frontEndAbiLocation}TradeToken.json`,
        tradeToken.interface.formatJson()
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const dsesCenter = await ethers.getContract("DSESCenter")
    const cityCitizen = await ethers.getContract("CityCitizen")
    //const cityIndustry = await ethers.getContract("CityIndustry")
    const pollutionToken = await ethers.getContract("PollutionToken")
    const pollutionNft = await ethers.getContract("PollutionNft")
    const tradeToken = await ethers.getContract("TradeToken")
    fs.writeFileSync(frontEndContractsAddressLocation,"{}")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsAddressLocation, "utf8"))
  
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["DSESCenter"].includes(await dsesCenter.getAddress())) {
            contractAddresses[chainId]["DSESCenter"].push(await dsesCenter.getAddress())
        }
        if (!contractAddresses[chainId]["CityCitizen"].includes(await cityCitizen.getAddress())) {
            contractAddresses[chainId]["CityCitizen"].push(await cityCitizen.getAddress())
        }/*
        if (!contractAddresses[chainId]["CityIndustry"].includes(await cityIndustry.getAddress())) {
            contractAddresses[chainId]["CityIndustry"].push(await cityIndustry.getAddress())
        }*/
        if (!contractAddresses[chainId]["PollutionToken"].includes(await pollutionToken.getAddress())) {
            contractAddresses[chainId]["PollutionToken"].push(await pollutionToken.getAddress())
        }
        if (!contractAddresses[chainId]["PollutionNft"].includes(await pollutionNft.getAddress())) {
            contractAddresses[chainId]["PollutionNft"].push(await pollutionNft.getAddress())
        }
        if (!contractAddresses[chainId]["TradeToken"].includes(await tradeToken.getAddress())) {
            contractAddresses[chainId]["TradeToken"].push(await tradeToken.getAddress())
        }
    } else {
        contractAddresses[chainId] = { DSESCenter: [await dsesCenter.getAddress()] , CityCitizen: [await cityCitizen.getAddress()],PollutionToken: [await pollutionToken.getAddress()], PollutionNft: [await pollutionNft.getAddress()], TradeToken: [await tradeToken.getAddress()]  }
    }
    fs.writeFileSync(frontEndContractsAddressLocation, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]