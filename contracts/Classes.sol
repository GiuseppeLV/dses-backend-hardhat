// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library classes {
    struct State {
        string name;
        string iso;
        uint256 numberOfCities;
        string attorneyName;
        string attorneySurname;
        string attorneyEmail;
        uint256 telephone;
        string physicalAddress;
    }

    struct City {
        string name;
        uint256 population;
        uint256 numberOfIndustries;
        string attorneyName;
        string attorneySurname;
        string attorneyEmail;
        uint256 telephone;
        string physicalAddress;
    }

    struct Citizen {
        string name;
        uint256 checkedTimestamp;
        string surname;
        string email;
        string dateOfBirth;
        uint256 telephone;
        string physicalAddress;
        string id; //used for bip44 wallet
    } /*
    struct Industry {
        string name;
        uint256 registrationTimestamp;
    }*/
}
