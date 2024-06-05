const networkConfig = {
  31337: {
    name: "localhost",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
}
const INITIAL_SUPPLY = "10000"

const developmentChains = ["sepolia","hardhat", "localhost"]

const frontEndContractsAddressLocation="../dses-frontend-nextjs/constants/NetworkMapping.json"
const frontEndAbiLocation="../dses-frontend-nextjs/constants/"

async function saveDeploy(dep,save,name) { //used to save a json into deployments to use getContract method to recover address into deployments scripts
  const artifact = await deployments.getExtendedArtifact(name);
  let proxyDeployments = {
      address: await dep.getAddress(),
      ...artifact
  }

  await save(name, proxyDeployments);
}



module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
  frontEndAbiLocation,
  frontEndContractsAddressLocation,
  saveDeploy
}
