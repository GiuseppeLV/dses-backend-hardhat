// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
error PollutionToken__Only_Allowed_Contracts();
error PollutionToken__Not_Enough_PT();
error Not_Your_Entity();

/// @title ERC-20 Contract for Pollution Tokens
/// @author Giuseppe La Vecchia
/// @notice It contains ERC-20 methods to maintain interoperability with other contracts or users, but it implement some methods for use in DSES dApp
/// @dev ERC721Enumerable is used because of tokenOfOwnerByIndex method.
/// @custom:experimental This is an experimental contract.

contract PollutionToken is Initializable {
    string private tokenName;
    string private tokenSymbol;
    uint8 private tokenDecimals;
    uint256 public _totalSupply;
    address private admin;
    uint256 private userCount; //number of DSES users
    mapping(address => address) contractAddresses; //used to store contract addresses allowed by admin that interact with this contract

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => address) public reversePartecipants; //used for the transfer from citizens/industry back to city and from city to state

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    event Burn(address indexed from, uint256 value);
    uint256 private ptInEthRate; //rate conversion PT to ETH

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */

    /*
    constructor(
        uint256 initialSupply,
        string memory _tokenName,
        string memory _tokenSymbol
    ) {
        _totalSupply = initialSupply * 10 ** uint256(tokenDecimals); // Update total supply with the decimal amount
        balances[msg.sender] = _totalSupply; // Give the creator all initial tokens
        admin = msg.sender;
        name = _tokenName; // Set the name for display purposes
        symbol = _tokenSymbol; // Set the symbol for display purposes
    }*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); //An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation contract, which may impact the proxy. This function in the constructor automatically lock it when it is deployed.
        //to get further information you can visit https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable
    }

    /**
     * Initialize function for the proxy upgradable pattern by OpenZeppelin
     *
     * @notice Initialize variables
     *
     * @param initialSupply the initial supply number of tokens
     * @param _tokenName token name
     * @param _tokenSymbol token symbol
     *
     */
    function initialize(
        uint256 initialSupply,
        string memory _tokenName,
        string memory _tokenSymbol
    ) public initializer {
        tokenDecimals = 18;
        _totalSupply = initialSupply * 10 ** uint256(tokenDecimals); // Update total supply with the decimal amount
        balances[msg.sender] = _totalSupply; // Give the creator all initial tokens
        admin = msg.sender;
        tokenName = _tokenName; // Set the name for display purposes
        tokenSymbol = _tokenSymbol; // Set the symbol for display purposes
        ptInEthRate = 23 * 10 ** 12; //1 PT is equal to 0.0000023ETH, so 10**14 gwei
    }

    function getAdminAddress() public view returns (address) {
        return admin;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function name() public view returns (string memory) {
        return tokenName;
    }

    function symbol() public view returns (string memory) {
        return tokenSymbol;
    }

    function decimals() public view returns (uint8) {
        return tokenDecimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * Transfer tokens sub-function
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     * @param _from the sender address
     * @notice the content of the second "if" condition is used by entities that will consume PT (actually citizens) to make them reach exactly 0 also when they consume more than that balance
     * while the else condition is for every other user
     *
     */

    function _transfer(address _from, address _to, uint256 _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != address(0x0));

        if (
            balances[_from] <= _value && contractAddresses[msg.sender] != admin
        ) {
            revert PollutionToken__Not_Enough_PT();
        }

        require(balances[_to] + _value >= balances[_to]);
        uint256 previousBalances = balances[_from] + balances[_to];
        if (
            balances[_from] <= _value && contractAddresses[msg.sender] == admin
        ) {
            balances[_to] = balances[_to] + balances[_from];
            emit Transfer(_from, _to, balances[_from]);
            balances[_from] = 0;
        } else {
            // Subtract from the sender
            balances[_from] -= _value;
            // Add the same to the recipient
            balances[_to] += _value;
            emit Transfer(_from, _to, _value);
        }
        assert(balances[_from] + balances[_to] == previousBalances);
        // Asserts are used to use static analysis to find bugs in the code. They should never fail
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * Transfer tokens with the "from" parameter
     *
     * Send `value` tokens to `to` 'from' your account
     *
     * @param to The address of the recipient
     * @param value the amount to send
     * @param from the address of the sender. This is added to allow this contract to forward transactions from other contracts, like from DSESCenter.sol or CityCitizen.sol
     */
    function transferExtended(
        address from,
        address to,
        uint256 value
    ) public onlyAllowedContracts {
        _transfer(from, to, value);
    }

    /**
     * Transfer tokens with the "from" parameter, used only for adding new entities to the system, like States,Cities or Citizens.
     *
     * Send `value` tokens to `to` 'from' your account
     *
     * @param to The address of the recipient
     * @param value the amount to send
     * @param from the address of the sender. This is added to allow this contract to forward transactions from other contracts, like from DSESCenter.sol or CityCitizen.sol
     * @notice userCount is used to count how many entities get registered to the system. It is used also for Citizens to generate a wallet for them with BIP44. ReversePartecipants is used to map the added entity (like Citizen) with the adding entity (like City) for rollback purpose, like giving back tokens to the "from" entity from the "to" entity.
     */

    function transferForAddingEntities(
        address from,
        address to,
        uint256 value
    ) public onlyAllowedContracts {
        if (balances[from] <= value) {
            revert PollutionToken__Not_Enough_PT();
        }
        reversePartecipants[to] = from;
        userCount = userCount + 1;
        transferExtended(from, to, value);
    }

    function getUserCount() public view returns (uint256) {
        return userCount;
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` on behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        //require(_value <= allowance[_from][msg.sender]); // Check allowance
        require(
            (_value <= allowance[_from][_to]) &&
                contractAddresses[msg.sender] == admin,
            "you are not allowed to do transferFrom function"
        );
        //allowance[_from][msg.sender] -= _value;
        allowance[_from][_to] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     *
     * @param receiver the address of the one who received tokens in transferForAddingEntities function
     */
    function getPreviousSender(address receiver) public view returns (address) {
        return reversePartecipants[receiver];
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     */
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        //allowance[msg.sender][_spender] = _value;
        require(contractAddresses[msg.sender] == admin, "you are not approved");
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * Store contract addresses that will interact with this contract
     *
     * @notice Allows 'contractAddr' to call some special function on behalf of the original msg.sender user.
     *
     * @param contractAddr The contract address authorized
     * @param sender the admin address
     */

    function storeContractAddress(address contractAddr, address sender) public {
        //sender will be msg.sender that has to be the admin
        require(
            sender == admin,
            "you are not allowed to do that, you are not the admin"
        );
        contractAddresses[contractAddr] = sender;
    }

    function getContractAddress() public view returns (address) {
        return msg.sender;
    }

    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value); // Check if the sender has enough
        balances[msg.sender] -= _value; // Subtract from the sender
        _totalSupply -= _value; // Updates _totalSupply
        emit Burn(msg.sender, _value);
        return true;
    }

    function getAllowance(
        address master,
        address slave
    ) public view returns (uint256) {
        return allowance[master][slave];
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(
        address _from,
        uint256 _value
    ) public returns (bool success) {
        require(balances[_from] >= _value); // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]); // Check allowance
        balances[_from] -= _value; // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value; // Subtract from the sender's allowance
        _totalSupply -= _value; // Update _totalSupply
        emit Burn(_from, _value); //updat
        return true;
    }

    function getPTtoEthRate() public view returns (uint256) {
        return ptInEthRate;
    }

    function setPTtoEthRate(uint256 newRate) public onlyAllowedContracts {
        ptInEthRate = newRate;
    }

    modifier onlyAllowedContracts() {
        if (contractAddresses[msg.sender] != admin) {
            revert PollutionToken__Only_Allowed_Contracts();
        }
        _;
    }

    /*
    function getPTValueInCurrency(
        uint256 ptAmount,
        address currencyAddress
    ) public view returns (uint256) {
        uint256 ethAmount = ptAmount * ptInEthRate;
        uint256 ethAmountConverted = conversionMethods.getConversionRate(
            ethAmount,
            currencyAddress
        );
        return ethAmountConverted;
    }*/
}
