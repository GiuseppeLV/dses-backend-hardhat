const { assert, expect } = require("chai")
const { network, deployments, ethers,upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

 describe("CityIndustry unit test", function () {
      let dsesCenter;
      let deployer
      let accounts
      let state
      let city
      let cityIndustryContract
      let pt
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        city=accounts[1]
        citizen=accounts[2]
        industry=accounts[3]
        state=accounts[4]
        const ptF = await ethers.getContractFactory("PollutionToken", accounts[0])//original admin
        pt=await upgrades.deployProxy(ptF, [10000000,"PollutionToken", "PT"])
        console.log("address pt:",await pt.getAddress())
        const dsesCenterF = await ethers.getContractFactory("DSESCenter", accounts[0])//original admin
        dsesCenter=await upgrades.deployProxy(dsesCenterF, [await pt.getAddress()]
            ,{initializer:"initialize"}); 
            console.log("address dsescenter:",await dsesCenter.getAddress())
        const cityIndustryContractF = await ethers.getContractFactory("CityIndustry", accounts[0])//original admin
        cityIndustryContract=await upgrades.deployProxy(cityIndustryContractF, [await pt.getAddress(), await dsesCenter.getAddress()]
            ,{initializer:"initialize"}); 

        stateName="italy"
        iso="ITA" //obtained in input
        await dsesCenter.addState(stateName,iso,state,7000)

        cityName="Agrigento"
        population=53600
        numberOfIndustries=5
        dsesCenter=dsesCenter.connect(state)
        await dsesCenter.addCity(cityName,population,numberOfIndustries,city.address)

        cityIndustryContract=cityIndustryContract.connect(city)

        await cityIndustryContract.addIndustry("Volvo",industry.address)
        
      })

      describe("constructor", function () {
          it("should set the admin address correctly", async () => {

              
          })
      })

      
      describe("addIndustry", function () {
        it("should add a new industry correctly", async () => {
            industryName="Volvo"
            address="0xdef9A2470609a45D9667E93e4A2926E2188DE1ea"

            await cityIndustryContract.addIndustry(industryName,address)
            console.log("popoazione della città dal contratto cityindustry:", await cityIndustryContract.checkForCity())
            checkExistingIndustry=await cityIndustryContract.checkExistingIndustry(address)        
            assert.equal(checkExistingIndustry,true)  
            assert.notEqual(await pt.balanceOf(address),0)  //check that the balance is different from 0    
        })

    })  

    describe("deleteIndustry", function () {
        it("should delete the industry", async () => {
        await cityIndustryContract.deleteIndustry(industry.address)
        assert.equal(await cityIndustryContract.checkExistingIndustry(industry.address), false)
    })

    

}) 
})   