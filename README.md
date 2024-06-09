# Decentralized System for Envirnmental Sustainability

## Introduction
This is the back-end project for DSES, you can find the front-end in https://github.com/GiuseppeLV/dses-frontend-nextjs.
Back-end uses [Hardhat](https://hardhat.org/docs) as development environment and [ethers](https://docs.ethers.org/v6/) for contracts deployment and interactions.

**The Decentralized System for Environmental Sustainability (DSES)** was created as a blockchain system to incentivize the population to reduce the amount of CO2, especially in the sectors relating to transport and industry. The incentive is given by the presence of NFTs which are attributed to citizens or industries that consume a quantity of CO2 below a certain threshold. The measurement takes place through tokens defined within a contract that implements the ERC-20 and defines the "Pollution Tokens". These are distributed by States/Nations and Cities to the relevant Citizens or Industries and indicate the maximum CO2 production limit for that specific entity.
Using CO2 sensors, sampling of carbon dioxide is carried out inside public transport exhausts (i.e. cars or buses) or industries. The result is converted into Pollution Tokens which will be deducted from the account of the entity that produced CO2 (in our case, the Citizen).
PollutionTokens can be also traded for ETH. In DSES is the State responsable for that action.

### Actors
 •**Admin** : is the one who has the main task of deploying, making changes to contracts and adding new states. 

 •**State** : the participating nation. It has the task of adding new cities to the dApp or removing them. It can also make token transfers to other states that request them.

 •**City** : the participating city. It has the task of adding new Citizens to the dApp or removing them. Each citizen will be assigned a new private key for the creation of a new wallet. 

 •**Citizen** :the participating citizen. It will use the private key provided by the City to create a new wallet and access the dApp. It is the only entity capable of obtaining NFTs. Consume Pollution Token every time data is produced from the CO2 sensor.

## Installation
First of all clone the repository locally: ```git clone https://github.com/GiuseppeLV/dses-backend-hardhat.git``` then install dependencies with by running ```npm install``` or ```yarn install```.

## Getting started
It's is possible to run a node locally using:

```bash
yarn hardhat node
```
Or you can deploy contracts to some networks, in this project it is used Sepolia network:

```bash
yarn hardhat deploy --network sepolia
```

That line of code will run all scripts into the ```bash deploy``` folder. If you want to run only one of these script,
you can use the  ```bash --tags``` option. For example, to run only the 03-deploy-DSESCenter, you can use:

```bash
yarn hardhat deploy --tags dsesCenter --network localhost
```
## Architecture

Here are presented only the main elements of DSES back-end

```plaintext
root/
├── contracts/
│     │
│     ├──interfaces/ => a folder with some interfaces useful for interoperability between contracts
│     ├──CityCitizen.sol => a contract mainly used by City and Citizen. There are some methods useful to add/modify or delete a Citizen or to │"consume PT"(sending Pollution Tokens from Citizen to belonging City), call for nft mint and so on.  
│     ├──DSESCenter.sol => a contract mainly used by Admin and State. There are some methods useful to add/modify or delete entities.
│     ├──PollutionNft.sol => ERC-721 contract used to create personalized SVG NFTs.
│     ├──PollutionToken.sol => ERC-20 contract used to manage Pollution Tokens.
│     ├──TradeToken.sol => a contract used to create a trade "PT for ETH" between entities, mainly used by States.
│     ├──Classes.sol => a library containing some structs
│     └──Library.sol => a library that can contain useful methods for all the contracts
│
├──deploy/ 
│    │
│    ├──0x-deploy-X.js => deploy scripts for each of the contracts. It is also used the Proxy Update Pattern by OpenZeppelin (more on https://│docs.openzeppelin.com/upgrades-plugins/1.x/proxies)
│    └──05-update-front-end.js => used for updating front-end with new ABIs or contract addresses.
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
