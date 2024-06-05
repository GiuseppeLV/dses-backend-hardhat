// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "../Classes.sol";

interface IDSESCenter {
    function getCityByAddr(
        address cityAddr
    ) external view returns (classes.City memory);

    function checkExistingCity(address cityAddr) external view returns (bool);
}
