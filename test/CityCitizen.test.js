const { assert, expect } = require("chai")
const { network, deployments, ethers, upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

describe("Citycitizen unit test", function () {
    let dsesCenter
    let deployer
    let accounts
    let state
    let city
    let cityCitizenContract
    let pt
    let pnft
    beforeEach(async () => {
        accounts = await ethers.getSigners()
        city = accounts[1]
        citizen = accounts[2]
        state = accounts[4]
        owner1 = accounts[3]
        owner2 = accounts[5]

        const ptnF = await ethers.getContractFactory(
            "PollutionNft",
            accounts[0],
        ) //original admin
        const svgind1 =
            '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="green">'
        const svgind2 =
            '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="black">'
        const svgcit1 =
            '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="yellow">'
        const svgcit2 =
            '<svg width="320" height="130" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="100" x="10" y="10" style="fill:rgb(0,0,255);stroke-width:3;stroke:red" /><text x="50" y="50" font-family="Arial" font-size="20" fill="red">'
        let svgind = [svgind1, svgind2]
        let svgcit = [svgcit1, svgcit2]

        pnft = await ptnF.deploy(svgind, svgcit)

        const ptF = await ethers.getContractFactory(
            "PollutionToken",
            accounts[0],
        ) //original admin
        pt = await upgrades.deployProxy(ptF, [10000000, "PollutionToken", "PT"])
        console.log("address pt:", await pt.getAddress())
        const dsesCenterF = await ethers.getContractFactory(
            "DSESCenter",
            accounts[0],
        ) //original admin
        dsesCenter = await upgrades.deployProxy(
            dsesCenterF,
            [await pt.getAddress()],
            { initializer: "initialize" },
        )
        console.log(
            "pnftaddres:",
            await pnft.getAddress(),
            "--",
            await pt.getAddress(),
            "--",
            await dsesCenter.getAddress(),
        )
        const cityCitizenContractF = await ethers.getContractFactory(
            "CityCitizen",
            accounts[0],
        ) //original admin
        cityCitizenContract = await upgrades.deployProxy(
            cityCitizenContractF,
            [
                await pt.getAddress(),
                await dsesCenter.getAddress(),
                await pnft.getAddress(),
            ],
            { initializer: "initialize" },
        )

        stateName = "italy"
        iso = "ITA" //obtained in input
        await dsesCenter.addState(
            stateName,
            iso,
            state,
            7000,
            "Mario",
            "Rossi",
            "mario.r@gmail.com",
            32856579098,
            "Via Armando Diaz",
            false,
        )
        cityName = "Licata"
        population = 53600
        numberOfIndustries = 5
        dsesCenter = dsesCenter.connect(state)
        await dsesCenter.addCity(
            cityName,
            population,
            numberOfIndustries,
            city.address,
            "Mario",
            "Rossi",
            "mario.r@gmail.com",
            32856579098,
            "Via Armando Diaz",
            false,
        )

        cityCitizenContract = cityCitizenContract.connect(city)
        const currentDate = new Date()
        const timestampInMilliseconds = currentDate.getTime()
        const timestamp = Math.floor(timestampInMilliseconds / 1000) //in seconds
        console.log("Timestamp1:", timestamp)
        await cityCitizenContract.addCitizen(
            "Mario",
            citizen.address,
            timestamp,
            "Rossi",
            "mario.r@gmail.com",
            "29/05/1997",
            32856579098,
            "Via Armando Diaz",
            "1",
            false,
        )
    })

    describe("constructor", function () {
        it("should set the admin address correctly", async () => {})
    })

    describe("addCitizen", function () {
        it("should add a new citizen correctly", async () => {
            citizenName = "Mario"
            address = "0xdef9A2470609a45D9667E93e4A2926E2188DE1ea"
            const currentDate = new Date()
            const timestampInMilliseconds = currentDate.getTime()
            const timestamp = Math.floor(timestampInMilliseconds / 1000) //in seconds
            await cityCitizenContract.addCitizen(
                citizenName,
                address,
                timestamp,
                "Rossi",
                "mario.r@gmail.com",
                "29/05/1997",
                32856579098,
                "Via Armando Diaz",
                "2",
                false,
            )
            checkExistingCitizen =
                await cityCitizenContract.checkExistingCitizen(address)
            const persona = await cityCitizenContract.getCitizen(address)
            console.log("Citizen:", persona[0])
            assert.equal(checkExistingCitizen, true)
            assert.notEqual(await pt.balanceOf(address), 0) //check that the balance is different from 0
        })
    })

    describe("deleteCitizen", function () {
        it("should delete the citizen", async () => {
            await cityCitizenContract.deleteCitizen(citizen.address)
            assert.equal(
                await cityCitizenContract.checkExistingCitizen(citizen.address),
                false,
            )
        })
    })

    describe("modifyCitizen", function () {
        it("should modify the citizen", async () => {
            const currentDate = new Date()
            const timestampInMilliseconds = currentDate.getTime()
            const timestamp = Math.floor(timestampInMilliseconds / 1000) //in seconds
            await cityCitizenContract.addCitizen(
                "Giovanni",
                citizen.address,
                timestamp,
                "Interlandi",
                "gint.r@gmail.com",
                "21/05/1947",
                32156579598,
                "Via Piave 3",
                "1",
                true,
            )
            citizen1 = await cityCitizenContract.getCitizen(citizen.address)
            assert.equal("Giovanni", citizen1[0])
        })
    })
    describe("consumePTFromCitizen", function () {
        //yarn hardhat test test/CityCitizen.test.js --grep consumePTFromCitizen

        beforeEach(async () => {
            cityCitizenContract = cityCitizenContract.connect(citizen)
        })
        it("should consume 1 pt from the citizen", async () => {
            await cityCitizenContract.consumePTFromCitizen(
                ethers.parseEther("1"),
            )
            console.log("BalanceOfCitizen:", await pt.balanceOf(citizen))
            assert.equal(await pt.balanceOf(citizen), 29 * 10 ** 18)
        })
        it("should give 2 NFT to the Citizen", async () => {
            await cityCitizenContract.consumePTFromCitizen(
                ethers.parseEther("11"),
            )
            await cityCitizenContract.checkForNft(
                await pt.balanceOf(citizen.address),
            ) //manual check because of the if condition for the x days passed

            const [nft0] = await pnft.tokensOfOwner(citizen.address)
            console.log("NFT 0:", nft0)

            assert.equal(nft0, await pnft.tokenURI(0))

            assert.equal(await pnft.getTokenCounter(), 1)
        })
        it("should emit the NoTokenCitizen event", async () => {
            await cityCitizenContract.consumePTFromCitizen(
                await pt.balanceOf(citizen.address),
            ) //consume all his tokens
            await expect(cityCitizenContract.consumePTFromCitizen(10)).to.emit(
                cityCitizenContract,
                "NoTokenCitizen",
            )
        })
    })
})
