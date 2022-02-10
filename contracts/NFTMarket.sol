//0x149E6e85b6D9b32702f2a14cB1A4817BA19Ede20

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFT721.sol";

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
        IERC721(_token).approve(address(this), _tokenID);
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
