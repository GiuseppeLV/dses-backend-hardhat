const { assert, expect } = require("chai")
const { network, deployments, ethers,upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

 describe("DSESCenter unit test", function () {
      let dsesCenter;
      let deployer
      let accounts
      let state
      let city
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        city=accounts[1]
        state=accounts[2]
        const ptF = await ethers.getContractFactory("PollutionToken", accounts[0])//original admin
        pt=await upgrades.deployProxy(ptF, [10000000,"PollutionToken", "PT"])

        const dsesCenterF = await ethers.getContractFactory("DSESCenter", accounts[0])//original admin
        dsesCenter=await upgrades.deployProxy(dsesCenterF, [await pt.getAddress()])
        console.log("bilancio admin:", await pt.balanceOf(accounts[0]))
        
        /*
        dsesCenterFactory = await ethers.getContractFactory("DSESCenter")
        dsesCenter = await dsesCenterFactory.deploy()
        
        */
        stateName="italy"
        iso="ITA" //obtained in input
        await dsesCenter.addState(stateName,iso,state.address,7000,"Mario","Rossi","mario.r@gmail.com",32856579098,"Via Armando Diaz",false)
        console.log("statename:", await pt.balanceOf(state.address))
        cityName="Agrigento"
        population=53600
        numberOfIndustries=5
        dsesCenter=dsesCenter.connect(state)
        await dsesCenter.addCity(cityName,population,numberOfIndustries,city.address,"Mario","Rossi","mario.r@gmail.com",32856579098,"Via Armando Diaz",false)
        
      })

      describe("constructor", function () {
          it("should set the admin address correctly", async () => {
              const response = await dsesCenterCity.getAdminAddress()
              deployer = (await getNamedAccounts()).deployer
              console.log("deployer:", response)
              assert.equal(response, deployer)
              
          })
      })
/*
      describe("addState", function () {
        it("should add a new state to the mapping using chainlink", async () => {

            stateName="italy"
            iso="ITA" //obtained in input
            address="0xed5ae0D509424781Ee4C2c98f013e9262046e2Eb"
            apiUrl="https://api.worldbank.org/v2/country/"+iso+"/indicator/SP.POP.TOTL?format=json"
            const transactionResponse=await dsesCenter.addState(stateName,iso,address,apiUrl)
            console.log("aspetto", transactionResponse)
            const receipt= await transactionResponse.wait()
            console.log(receipt)
            console.log(dsesCenter.states[address].name)
            console.log("aspetto2")
            checkExistingState=await dsesCenter.checkExistingState(address)
            console.log("aspetto1")
           
            //assert.equal("italy", dsesCenter.states[address].name())
            assert.equal(checkExistingState,true)
        })
    })*/

    describe("addState", function () {
        it("should add a new state to the mapping using localhost", async () => {

            stateName="germany"
            iso="DEU" //obtained in input
            address="0xdef9A2470609a45D9667E93e4A2926E2188DE1ea"
            dsesCenter=dsesCenter.connect(accounts[0])
            await dsesCenter.addState(stateName,iso,address,83000000,"Mario","Rossi","mario.r@gmail.com",32856579098,"Via Armando Diaz",false)

            console.log("balanciosender",await pt.balanceOf(accounts[0]))

            checkExistingState=await dsesCenter.checkExistingState(address)        
            assert.equal(checkExistingState,true)
        })
    })

    describe("deleteState", function () {
        it("should delete a state ", async () => {
            iso="ITA"
            const transactionResponse=await dsesCenter.deleteState(state)
            checkDelete= await dsesCenter.checkExistingState(state)
            assert.equal(checkDelete,false)
        })
    })


    describe("addCity", function () {
        it("should add a new city to the mapping using localhost", async () => {

            cityName="Agrigento"
            address="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            iso="ITA"
            population=53600
            numberOfIndustries=30
            dsesCenter=dsesCenter.connect(state)
            await dsesCenter.addCity(cityName,population,numberOfIndustries,address,"Mario","Rossi","mario.r@gmail.com",32856579098,"Via Armando Diaz",false)

            checkExistingCity=await dsesCenter.checkExistingCity(city.address)        
            assert.equal(checkExistingCity,true)
        })
    })

    describe("deleteCity", function () {
        it("should delete a city by address", async () => {

            address="0xdef9A2470609a45D9667E93e4A2926E2188DE1ea"

            const isDeleted=await dsesCenter.deleteCity(address)
            checkDelete= await dsesCenter.checkExistingCity(address)
            console.log("ciao:", isDeleted);
            console.log("current year:", await dsesCenter.getCurrentYear())
    
            assert.equal(checkDelete,false)
        })
    })
    })