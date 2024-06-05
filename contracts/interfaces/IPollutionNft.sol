// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IPollutionNft {
    function mintNftIndustry(address to, uint256 level) external;

    function storeContractAddress(
        address contractAddr,
        address sender
    ) external;

    function mintNftCitizen(address to, uint256 level) external;
}
