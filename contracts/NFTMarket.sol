//0x973eeb90e409073F749C827b1232f4159AC838f8
//https://rinkeby.etherscan.io/address/0x973eeb90e409073F749C827b1232f4159AC838f8#code

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFT.sol";

contract NFTMarket {
    uint256 private listingID = 0;

    enum Status {
        Active,
        Sold,
        Canceled
    }

    struct Listing {
        address seller;
        address token;
        uint256 tokenID;
        uint256 price;
        Status status;
    }
    mapping(uint256 => Listing) private listings;

    // function mint(address _token, string memory tokenURI) {
    //     IERC721(_token).mint();
    // }

    function listItem(
        address _token,
        uint256 _tokenID,
        uint256 _price
    ) public {
        IERC721(_token).transferFrom(msg.sender, address(this), _tokenID);

        //     NFT.transferFrom(
        //     address from,
        //     address to,
        //     uint256 tokenId
        // )
        Listing memory listing = Listing({
            seller: msg.sender,
            token: _token,
            tokenID: _tokenID,
            price: _price,
            status: Status.Active
        });
        listings[listingID] = listing;
        listingID++;
    }

    function buyItem(uint256 _listingID) external payable {
        Listing storage listing = listings[_listingID];
        require(listing.status == Status.Active, "Isn't listed");
        require(listing.seller != msg.sender, "Owner can't buy his token");
        require(msg.value >= listing.price, "Isn't enought money to buy");
        listing.status = Status.Sold;
    }
}
