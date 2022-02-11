//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    constructor() ERC721("NFTforMarket", "NFT") {}

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    function mint(string memory tokenURI, address _to)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(_to, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds.increment();
        return newItemId;
    }

    // function approve(address to, uint256 tokenId) public {
    //     approve(to, tokenId);
    // }
}
//0x0d04Be8a34282b93c552dbBbEFB5Cf7dFD5300E3
//https://ethereum.stackexchange.com/questions/121176/error-when-trying-to-verify-contract
