// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CarbonCredit is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Credit {
        uint256 co2Amount; // in grams
        uint256 timestamp;
        string activityType;
    }

    mapping(uint256 => Credit) public credits;

    event CreditMinted(
        address indexed user,
        uint256 indexed tokenId,
        uint256 co2Amount,
        string activityType
    );

    constructor() ERC721("CarbonCredit", "CO2") {}

    function mintCredit(
        address user,
        uint256 co2Amount,
        string memory activityType
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(user, newTokenId);

        credits[newTokenId] = Credit({
            co2Amount: co2Amount,
            timestamp: block.timestamp,
            activityType: activityType
        });

        emit CreditMinted(user, newTokenId, co2Amount, activityType);

        return newTokenId;
    }

    function getCredit(uint256 tokenId) external view returns (Credit memory) {
        require(_exists(tokenId), "Credit does not exist");
        return credits[tokenId];
    }

    function getUserCredits(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 counter = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == user) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }
}