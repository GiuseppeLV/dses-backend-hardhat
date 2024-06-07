// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IPollutionToken {
    function transferExtended(address from, address to, uint256 value) external;

    function getPreviousSender(address from) external view returns (address);

    function deletePreviousSender(address receiver) external;

    function storeContractAddress(
        address contractAddr,
        address sender
    ) external;

    function balanceOf(address _owner) external view returns (uint256 balance);

    function transferForAddingEntities(
        address from,
        address to,
        uint256 value
    ) external;

    function getUserCount() external view returns (uint256);

    function getPTtoEthRate() external view returns (uint256);
}
