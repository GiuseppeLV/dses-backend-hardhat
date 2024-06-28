// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();
error PollutionNft__Only_Admin_Allowed();
error PollutionNft__No_Owned_Tokens();

/// @title An SVG NFT contract.
/// @author Giuseppe La Vecchia
/// @notice Used for NFTs creation, assignment and visualization
/// @dev ERC721Enumerable is used because of tokenOfOwnerByIndex method.
/// @custom:experimental This is an experimental contract.

contract PollutionNft is ERC721Enumerable {
    uint256 private s_tokenCounter;
    mapping(string => string) private industrySvgMap;
    mapping(string => string) private citizenSvgMap;
    mapping(address => address) private contractAddresses;
    address private admin;

    string[2] private industryBaseSvg;
    string[2] private citizenBaseSvg;
    mapping(uint256 => string) private tIDtoImageURI;
    event CreatedNFT(uint256 indexed tokenId, string typeOfNft, uint256 level);

    /**
     * Adding SVG NFTs
     *
     *
     * @param citizenSvg the SVGs used for the customized NFTs
     *
     */
    constructor(
        string[2] memory industrySvg,
        string[2] memory citizenSvg //format:<svg width=\"320\" height=\"130\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"300\" height=\"100\" x=\"10\" y=\"10\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:red\" /><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"20\" fill=\"black\">
    ) ERC721("Pollution NFT", "PNFT") {
        //the rest of the svg will be added lately, like the text that will be the address of the "minter"
        s_tokenCounter = 0;
        admin = msg.sender;
        for (uint256 i = 0; i < industrySvg.length; i++) {
            industryBaseSvg[i] = industrySvg[i];
        }

        for (uint256 i = 0; i < citizenSvg.length; i++) {
            citizenBaseSvg[i] = citizenSvg[i];
        }
    }

    function getCitizenSvg(uint256 i) public view returns (string memory) {
        return citizenBaseSvg[i];
    }

    function getIndustrySvg(uint256 i) public view returns (string memory) {
        return industryBaseSvg[i];
    }

    function mintNftIndustry(address to, uint256 level) public onlyOwners {
        uint256 newTokenId = s_tokenCounter;
        tIDtoImageURI[newTokenId] = svgToImageURI(industryBaseSvg[level], to);
        //s_tokenIdToHighValues[newTokenId] = level;
        _safeMint(to, newTokenId);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(newTokenId, "industry", level);
    }

    /**
     * Minting NFTs for Citizens
     *
     * "Giving" an NFT to a Citizen based on the level.
     *
     * @param to the address of the citizen
     * @param level the NFT level. The higher it is, the more the citizen has saved PollutionTokens.
     */

    function mintNftCitizen(address to, uint256 level) public onlyOwners {
        uint256 newTokenId = s_tokenCounter;

        tIDtoImageURI[newTokenId] = svgToImageURI(citizenBaseSvg[level], to);
        _safeMint(to, newTokenId);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(newTokenId, "citizen", level);
    }

    /**
     * Returning NFTs by owner's address
     *
     * @param owner the address of the owner
     * @return URIs list of tokens, useful for visualization purpose
     */

    function tokensOfOwner(
        address owner
    ) public view returns (string[] memory) {
        uint256 balanceOfOwner = balanceOf(owner);
        if (balanceOfOwner == 0) {
            revert PollutionNft__No_Owned_Tokens();
        }
        string[] memory tokenURIs = new string[](balanceOfOwner); //array of the dimension of the number of tokens
        for (uint256 i = 0; i < balanceOfOwner; i++) {
            tokenURIs[i] = tokenURI(tokenOfOwnerByIndex(owner, i));
        }
        return tokenURIs;
    }

    /**
     * Building SVG image personalized
     *
     * @param svg the standard svg format for DSES
     * @param to used to add the address of the one who obtain the NFT, for personalization purpose. It will display the address of the one who obtain the nft.
     *
     */

    function svgToImageURI(
        string memory svg,
        address to
    ) public pure returns (string memory) {
        // example:
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
        // would return ""

        string memory endOfSvg = "</text></svg>";
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(
                string(abi.encodePacked(svg, Strings.toHexString(to), endOfSvg))
            )
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        string memory imageURI = tIDtoImageURI[tokenId];
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '" original owner address:"',
                                Strings.toHexString(_ownerOf(tokenId)),
                                '", "description":"An NFT for the DSES application", ',
                                '"image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /**
     * Store contract addresses that will interact with this contract
     *
     * Allows 'contractAddr' to call some special function on behalf of the original msg.sender user.
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

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    modifier onlyOwners() {
        if (contractAddresses[msg.sender] != admin) {
            revert PollutionNft__Only_Admin_Allowed();
        }

        _;
    }
}
