// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

//import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library methods {
    function dayTimestamp(
        uint256 numberOfDays
    ) internal pure returns (uint256) {
        return numberOfDays * 86400; //86400 is the number of seconds in one day
    }
}

library conversionMethods {
    /*
    function getPrice(address currencyAddress) internal view returns (uint256) {
        // Sepolia ETH / USD Address
        // https://docs.chain.link/data-feeds/price-feeds/addresses#Sepolia%20Testnet
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            //0x694AA1769357215DE4FAC081bf1f309aDC325306
            currencyAddress
        );
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        int256 convertValue = int256(10 ** (18 - priceFeed.decimals()));
        return uint256(answer * convertValue); //it has 8 decimals precisions, so need to add 10 decimals
        // or (Both will do the same thing)
        // return uint256(answer * 1e10); // 1* 10 ** 10 == 10000000000
    }

    // 1000000000
    function getConversionRate(
        uint256 ethAmount,
        address currencyAddress
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(currencyAddress);
        uint256 ethAmountInCurrency = (ethPrice * ethAmount) / 1e18;
        // or (Both will do the same thing)
        // uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // 1 * 10 ** 18 == 1000000000000000000
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInCurrency;
    }*/
}
