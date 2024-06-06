// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./Classes.sol";
//import {IDSESCenter} from "./DSESCenter.sol";
import "./interfaces/IDSESCenter.sol";
import "./interfaces/IPollutionToken.sol";
import "./interfaces/IPollutionNft.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {methods} from "./Library.sol";

/// @title A contract to be used by Cities and Citizens
/// @author Giuseppe La Vecchia
/// @notice Used for CRUD operations and for consuming PT by the Citizen
/// @dev for testing the checkingForExpiredToken function, it is needed to the "if" statement, because it will trigger the content only once every 30 days
/// @custom:experimental This is an experimental contract.

contract CityCitizen is Initializable {
    //for login purposes

    mapping(address => classes.Citizen) private citizens;
    uint256 private constant multiplier = 10 ** 18; //18 are the decimals
    IPollutionToken private pt;
    address private admin;
    IDSESCenter private dsesCenter;
    IPollutionNft private pnft;
    event NoTokenCitizen(address indexed citizenAddr, uint256 timestamp);
    error CityCitizen__Citizen_Not_Found();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); //An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation contract, which may impact the proxy. This function in the constructor automatically lock it when it is deployed.
        //to get further information you can visit https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable
    }

    /**
     * Initialize function for the proxy upgradable pattern by OpenZeppelin
     *
     * @notice Initialize variables. The address of this contract is passed to the storeContractAddress function of the ptContract and pollution nft contract, allowing this contract to call its functions
     *
     * @param ptContractAddress the contract address of the PollutionToken contract, used by this contract.
     * @param dsesCenterAddress the contract address of the DSESCenter contract, used by this contract.
     * @param pnftAddress the contract address of the PollutionNft contract, used by this contract.
     *
     */
    function initialize(
        IPollutionToken ptContractAddress,
        IDSESCenter dsesCenterAddress,
        IPollutionNft pnftAddress
    ) public initializer {
        admin = msg.sender;
        pt = ptContractAddress;
        pnft = pnftAddress;
        dsesCenter = dsesCenterAddress;
        pnft.storeContractAddress(address(this), msg.sender);
        pt.storeContractAddress(address(this), msg.sender);
    }

    /*
    function updateContractAddress(address newAddr) public onlyAdmin {
        //used when redeployed only PollutionToken contract
        pt = IPollutionToken(newAddr);
        pt.storeContractAddress(address(this), msg.sender);
    }
*/
    function getAdminAddress() public view returns (address) {
        return admin;
    }

    /**
     * Add a new citizen instance
     *
     * @notice Allows a City to add a new citizen giving an initial amount of PollutionTokens. It can also be used for editing purpose of the Citizen's parameters.
     *
     * @param isModify if true, it means that the caller of this function want to change something in a Citizen. Otherwise it is an addition operation.
     * @dev if it is not a modify action, the getUserCount is called. In the other case, the citizen with an already id is provider (in id = getCitizen(citizenAddr).id; code line)
     */
    function addCitizen(
        string memory name,
        address citizenAddr,
        uint256 checkedTimestamp,
        string memory surname,
        string memory email,
        string memory dateOfBirth,
        uint256 telephone,
        string memory physicalAddress,
        bool isModify
    ) public {
        require(
            dsesCenter.checkExistingCity(msg.sender) &&
                (!checkExistingCitizen(citizenAddr) || isModify),
            "You are not a city or citizen already exist"
        );
        uint256 id;
        //uint256 tokensAssigned = tokenToBeAssigned(); //this is omitted for semplicity and testing and it is used a constant value
        //uint256 tokensAssigned = 30 * multiplier;
        if (!isModify) {
            pt.transferForAddingEntities(
                msg.sender,
                citizenAddr,
                tokenToBeAssigned()
            );
            id = pt.getUserCount();
        } else {
            id = getCitizen(citizenAddr).id;
        }
        citizens[citizenAddr] = classes.Citizen(
            name,
            checkedTimestamp,
            surname,
            email,
            dateOfBirth,
            telephone,
            physicalAddress,
            id
        );
        //
    }

    function tokenToBeAssigned() public pure returns (uint256) {
        /*
        classes.City memory city = dsesCenter.getCityByAddr(msg.sender);
        return
            (pt.balanceOf(msg.sender) / //balanceOfCity/(cityPopulation+20*cityNumberOfIndustries). 20 is an arbitrary number, just to allocate more tokens to industries
                (city.population + 20 * city.numberOfIndustries)) * multiplier; //getCityByAddr used because A struct is an example of a dynamically sized type that can only be passed around internally
    */
        return 30 * multiplier;
    }

    /**
     * Consume PollutionToken by Citizen
     *
     * @notice a Citizen equipped with a sensor will send a certain amount of data produced ('amountUsed') periodically. If its PollutionToken balance is not 0, he send back to the City that amountUsed of PT, otherwise he emit an Event notifying States that he finished his tokens. Before doing that,it is necessary to check that 1 month has not passed since the beginning of a new cycle (Start of the cycle->consumingPT->end of a month->give back to city the remaining PT->if any, give NFTs to Citizen).
     *
     * @param amountUsed the contract address of the PollutionToken contract, used by this contract.
     *
     */
    function consumePTFromCitizen(uint256 amountUsed) public {
        uint256 balanceOfCitizen = pt.balanceOf(msg.sender);
        address previousSender = pt.getPreviousSender(msg.sender);
        checkForExpiredToken(balanceOfCitizen, previousSender);
        if (balanceOfCitizen != 0) {
            pt.transferExtended(
                msg.sender,
                previousSender,
                amountUsed //can be also used a formula to calculate the amount of token to transfer
            );
        } else {
            uint256 currentTimestamp = block.timestamp;
            emit NoTokenCitizen(msg.sender, currentTimestamp);
        }
    }

    /**
     * Check if a month has passed
     *
     * @notice first it check if a month has passed since the last execution of the content of the first "if" condition. If so, it will check if an NFT can be given to the Citizen checking its current balance, then it will refill the citizen's tokens
     *
     * @param balanceOfCitizen the citizen's balance
     * @param previousSender it is the city that added the citizen
     *
     */
    function checkForExpiredToken(
        uint256 balanceOfCitizen,
        address previousSender
    ) private {
        if (
            (block.timestamp - citizens[msg.sender].checkedTimestamp) >= //check if 30 days has passed.
            methods.dayTimestamp(30)
        ) {
            //uint256 balanceOfCitizen = pt.balanceOf(msg.sender);
            checkForNft(balanceOfCitizen);
            pt.transferExtended(
                previousSender,
                msg.sender,
                tokenToBeAssigned() - balanceOfCitizen //example: 30 fixed tokens - 17 of balanceOfCitizen=13 token to be refilled to the citizen
            ); //return back to the state the tokens remained
            citizens[msg.sender].checkedTimestamp = block.timestamp; //update citizen timestamp with the new timestamp of the actual date
        }
    }

    function getCitizen(
        address citizenAddr
    ) public view returns (classes.Citizen memory) {
        if (!checkExistingCitizen(citizenAddr)) {
            revert CityCitizen__Citizen_Not_Found();
        }
        return citizens[citizenAddr];
    }

    /**
     *
     * @notice This will return true if citizen was added by a city, otherwise false. getPreviousSender contains a mapping(addressOfEntityChildren=>addressOfEntityFather) where father is the entity that add the children, like city add citizen.
     *
     * @param citizenAddr address of that citizen to check
     */
    function checkExistingCitizenOfACity(
        address citizenAddr
    ) public view returns (bool) {
        if (pt.getPreviousSender(citizenAddr) == msg.sender) {
            return true;
        }
        return false;
    }

    function checkForNft(uint256 balanceOfCitizen) public {
        //modify to private after testing
        {
            //uint256 balanceOfCitizen = pt.balanceOf(msg.sender);
            if (
                (balanceOfCitizen > 5 * multiplier) &&
                (balanceOfCitizen <= 10 * multiplier)
            ) //5 and 10 are random numbers, we want to check that 5<=balanceOfCitizen<=10 Pollution tokens
            {
                pnft.mintNftCitizen(msg.sender, 0); //level 1 nft
            } else if (
                (balanceOfCitizen > 10 * multiplier) &&
                (balanceOfCitizen <= 29 * multiplier)
            ) {
                pnft.mintNftCitizen(msg.sender, 1);
            }
        }
    }

    function checkExistingCitizen(
        address citizenAddr
    ) public view returns (bool) {
        return bytes(citizens[citizenAddr].name).length > 0;
    }

    function deleteCitizen(
        address citizenAddr
    ) public onlyBelongingCity(citizenAddr) {
        pt.transferExtended(citizenAddr, msg.sender, pt.balanceOf(citizenAddr));
        delete citizens[citizenAddr];
    }

    modifier onlyAdmin() {
        require(
            (msg.sender == admin),
            "You are not the owner of this contract"
        );
        _;
    }

    /**
     *
     * @notice if City (the msg.sender) isn't the same that added that specific citizen with citizenAddr, revert the transaction
     *
     * @param citizenAddr address of that citizen that you want to check
     */
    modifier onlyBelongingCity(address citizenAddr) {
        if (pt.getPreviousSender(citizenAddr) != msg.sender) {
            revert CityCitizen__Citizen_Not_Found();
        }
        _;
    }
}
