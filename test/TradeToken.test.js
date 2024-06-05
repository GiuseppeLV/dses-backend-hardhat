const { assert, expect } = require("chai")
const { network, deployments, ethers,upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

 describe("TradeToken unit test", function () {
    let sender
    let receiver
    let td
    let pt
     
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        
        sender=accounts[1]
        receiver=accounts[2]
        const ptF = await ethers.getContractFactory("PollutionToken", accounts[0])//original admin
        pt=await upgrades.deployProxy(ptF, [10000000,"PollutionToken", "PT"])
        const tdF = await ethers.getContractFactory("TradeToken", accounts[0])//original admin
        
        td=await tdF.deploy(pt)
        await pt.transfer(sender.address,ethers.parseUnits("300",18))
        console.log("deployed!")
        
      })

      describe("startTrade", function () {
        it("should start a trade", async () => {
          td=td.connect(sender)
          await td.startTrade(50,receiver)
          const trades=await td.returnTrades(receiver)
          assert.equal(1, trades.length)
          //assert.exists(await ptn.tokenURI(0))
        })    
    })

    describe("endTrade", function () {
        it("should end a trade correctly removing from the trade from list", async () => {
          td=td.connect(sender)
          await td.startTrade(50,receiver)
          td=td.connect(receiver)
          const trades=await td.returnTrades(receiver)
          const trades3=await td.getTradeById(2)
          console.log("TRADES3:",trades3)
          await td.endTrade(trades[0][2],receiver,{value:ethers.parseEther("168")})
          const trades2=await td.returnTrades(receiver)
          
          assert.notEqual(trades,trades2)
          assert.equal(ethers.parseUnits("50",18), await pt.balanceOf(receiver.address))
          assert.equal(1, trades.length)
        })    
    })
    })