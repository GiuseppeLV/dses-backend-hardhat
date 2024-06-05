const { assert, expect } = require("chai")
const { network, deployments, ethers,upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

 describe("PollutionNft unit test", function () {
    let owner1,owner2
    let ptn
    let industry1
     
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        let owners
        
        owner1=accounts[1]
        owner2=accounts[2]
        industry1=accounts[3]
        console.log("owners:",owners[0])
        const ptnF = await ethers.getContractFactory("PollutionNft", accounts[0])//original admin
        const svgind1="<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"green\">"
        const svgind2="<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"black\">"
        const svgcit1="<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"yellow\">"
        const svgcit2="<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"blue\">"
        let svgind=[svgind1,svgind2]
        let svgcit=[svgcit1,svgcit2]
        ptn=await ptnF.deploy(svgind, svgcit)
        console.log("deployed!")
        
      })

      describe("constructor", function () {
          it("should set the svgs correctly", async () => {
            assert.equal(await ptn.getCitizenSvg(0),"<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"yellow\">")
          })
      })

      describe("mintNftIndustry", function () {
        it("should mint the nft correctly for the target industry", async () => {
          ptn=ptn.connect(owner1)
          await ptn.mintNftIndustry(industry1,1)
          console.log("TokenURI:", await ptn.tokenURI(0))
          assert.equal(1,await ptn.getTokenCounter())
          assert.exists(await ptn.tokenURI(0))
        })
    })
    })