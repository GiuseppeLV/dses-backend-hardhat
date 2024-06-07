// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./interfaces/IPollutionToken.sol";
import "./Classes.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title A contract to be used by Admin(deployer) and States
/// @author Giuseppe La Vecchia
/// @notice Used for CRUD operations by States and Admin
/// @custom:experimental This is an experimental contract.

contract DSESCenter is Initializable {
    address private admin;
    IPollutionToken private pt;
    //ChainlinkTools private ct;
    uint256 private constant multiplier = 10 ** 18;

    mapping(address => classes.State) private states; //for login purposes
    mapping(address => classes.City) private cities;

    error DSESCenter__Only_Admin_Allowed();
    error DSESCenter__State_Not_Found();
    error DSESCenter__City_Not_Found();

    /*
    constructor(PollutionToken ptContractAddress) {
        admin = msg.sender;
        pt = ptContractAddress;
        pt.storeContractAddress(address(this), msg.sender);
        ct = new ChainlinkTools();
    }
*/
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); //An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation contract, which may impact the proxy. This function in the constructor automatically lock it when it is deployed.
        //to get further information you can visit https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable
    }

    /**
     * Initialize function for the proxy upgradable pattern by OpenZeppelin
     *
     * @notice Initialize variables. The address of this contract is passed to the storeContractAddress function of the ptContract, allowing this contract to call its functions
     *
     * @param ptContractAddress the contract address of the PollutionToken contract, used by this contract.
     *
     *
     */
    function initialize(IPollutionToken ptContractAddress) public initializer {
        admin = msg.sender;
        pt = ptContractAddress;
        pt.storeContractAddress(address(this), msg.sender);
    }

    function getCityByAddr(
        address cityAddr
    ) public view returns (classes.City memory) {
        return cities[cityAddr];
    }

    function getContractAddress() public view returns (address) {
        return address(pt);
    }

    /**
     * Add a new state instance
     *
     * @notice Allows an Admin to add a new state giving an initial amount of PollutionTokens.It can also be used for editing purpose of the State's parameters.
     * @dev all the require means that you can enter the function in 2 cases: 1)if you are an admin and you are going to modify an existing state (added previously by an Admin) 2)If you are an admin and you want to add a non-existing state, so you are not going to modify
     * @param isModify if true, it means that the caller of this function want to change something in a State. Otherwise it is an addition operation.
     */

    function addState(
        string memory name,
        string memory iso,
        address stateAddr,
        uint256 numberOfCities,
        string memory attorneyName,
        string memory attorneySurname,
        string memory attorneyEmail,
        uint256 telephone,
        string memory physicalAddress,
        bool isModify
    ) external {
        bool isAdmin = (msg.sender == admin);
        address adminAddrExisting = pt.getPreviousSender(stateAddr);
        require(
            (isAdmin && isModify && adminAddrExisting == admin) ||
                (isAdmin && !isModify && adminAddrExisting == address(0)),
            "Error while adding a new state. Maybe you are not the owner or the state already exist"
        );
        states[stateAddr] = classes.State(
            name,
            iso,
            numberOfCities,
            attorneyName,
            attorneySurname,
            attorneyEmail,
            telephone,
            physicalAddress
        );
        if (!isModify) {
            pt.transferForAddingEntities(
                msg.sender,
                stateAddr,
                300000 * multiplier
            ); //modificable}
        }
    }

    /**
     *
     * @notice Allows an admin to delete a state
     * @dev deletes mapping location here and in the previousSender mapping. PreviousSenderMapping is a relation between a sender of PT(the one who add an entity, like the admin) and a receiver of PT (the one who was added by an entity, like a state)
     * @param stateAddr stateAddress to delete
     */

    function deleteState(address stateAddr) external onlyAdmin {
        if (checkExistingState(stateAddr)) {
            pt.transferExtended(stateAddr, msg.sender, pt.balanceOf(stateAddr));
            delete states[stateAddr];
            pt.deletePreviousSender(stateAddr);
        } else {
            revert DSESCenter__State_Not_Found();
        }
    }

    function getState(
        address stateAddr
    ) public view returns (classes.State memory) {
        return states[stateAddr];
    }

    function checkExistingState(address addr) public view returns (bool) {
        return bytes(states[addr].name).length > 0; //mapping are initialized as 0.
    }

    function checkExistingAdmin(address addr) public view returns (bool) {
        return admin == addr;
    }

    /**
     * Add a new city instance
     *
     * @notice Allows a State to add a new city giving an initial amount of PollutionTokens.It can also be used for editing purpose of the City's parameters.
     * @dev all the require means that you can enter the function in 2 cases: 1)if you are a state and you are going to modify an existing city (added previously by an state) 2)If you are a state and you want to add a non-existing city, so you are not going to modify
     * @param isModify if true, it means that the caller of this function want to change something in a City. Otherwise it is an addition operation and a transfer of PT will be done
     */
    function addCity(
        string memory name,
        uint256 population,
        uint256 numberOfIndustries,
        address cityAddr,
        string memory attorneyName,
        string memory attorneySurname,
        string memory attorneyEmail,
        uint256 telephone,
        string memory physicalAddress,
        bool isModify
    ) external {
        bool isStateExisting = checkExistingState(msg.sender);
        address stateAddrExisting = pt.getPreviousSender(cityAddr);

        require(
            (isStateExisting && isModify && stateAddrExisting == msg.sender) ||
                (isStateExisting &&
                    !isModify &&
                    stateAddrExisting == address(0)),
            "Error while adding a new city. Maybe you are not a state or the city already exist"
        );

        cities[cityAddr] = classes.City(
            name,
            population,
            numberOfIndustries,
            attorneyName,
            attorneySurname,
            attorneyEmail,
            telephone,
            physicalAddress
        );
        /*
        uint256 tokenAssigned = (
            (pt.balanceOf(msg.sender) / states[msg.sender].numberOfCities)
        ) * multiplier; //#(tokenState/numberOfCitiesState)/cityPopulation
        */
        if (!isModify) {
            uint256 tokenAssigned = 10000 * multiplier;
            pt.transferForAddingEntities(msg.sender, cityAddr, tokenAssigned);
        }
    }

    function checkExistingCity(address cityAddr) public view returns (bool) {
        return bytes(cities[cityAddr].name).length > 0; //mapping are initialized as 0 for uint256 as default.
    }

    function deleteCity(
        address cityAddr
    ) external onlyBelongingState(cityAddr) {
        pt.transferExtended(cityAddr, msg.sender, pt.balanceOf(cityAddr));
        delete cities[cityAddr];
        pt.deletePreviousSender(cityAddr);
    }

    function getCity(
        address cityAddr
    ) public view returns (classes.City memory) {
        return cities[cityAddr];
    }

    /**
     *
     * @notice This will return true if city was added by a state, otherwise false. getPreviousSender contains a mapping(addressOfEntityChildren=>addressOfEntityFather) where father is the entity that add the children, like state add city.
     *
     * @param cityAddr address of that city to check
     */
    function checkExistingCityOfAState(
        address cityAddr,
        address stateAddr
    ) public view returns (bool) {
        if (pt.getPreviousSender(cityAddr) == stateAddr) {
            return true;
        }
        return false;
    }

    modifier onlyAdmin() {
        if ((msg.sender != admin)) {
            revert DSESCenter__Only_Admin_Allowed();
        }
        _;
    }
    /**
     *
     * @notice if State (the msg.sender) isn't the same that added that specific city with cityAddr, revert the transaction
     *
     * @param cityAddr address of that city that you want to check
     */
    modifier onlyBelongingState(address cityAddr) {
        if (pt.getPreviousSender(cityAddr) != msg.sender) {
            revert DSESCenter__City_Not_Found();
        }
        _;
    }
}
