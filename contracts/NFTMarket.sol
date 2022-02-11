//0x2A6951f0d302a2f890EA8DFB9986402D4F21adc7
//https://rinkeby.etherscan.io/address/0x973eeb90e409073F749C827b1232f4159AC838f8#code

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFT.sol";

contract NFTMarket is NFT {
    uint256 private listingID = 0;
    uint256 private auctionID = 0;

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

    struct Auction {
        address seller;
        address token;
        uint256 tokenID;
        uint256 bidPrice;
        uint256 bidCount;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        address lastBidder;
        Status status;
    }

    mapping(uint256 => Listing) private listings;
    mapping(uint256 => Auction) private auctions;
    mapping(address => uint256) private biddersPrice;
    address[] private biddersArr;

    // function mint(address _token, string memory tokenURI) {
    //     IERC721(_token).mint();
    // }

    function createItem(string memory _tokenURI) private returns (bool) {
        NFT.mint(_tokenURI);
        return true;
    }

    function listItem(
        address _token,
        uint256 _tokenID,
        uint256 _price
    ) public {
        address owner = IERC721(_token).ownerOf(_tokenID);
        require(owner == msg.sender, "only owner can list token");
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
        IERC721(listing.token).transferFrom(
            address(this),
            msg.sender,
            listing.tokenID
        );
        listing.status = Status.Sold;
    }

    function cancelListing(uint256 _listingID) external {
        Listing storage listing = listings[_listingID];
        require(listing.seller == msg.sender, "not owner");
        listing.status = Status.Canceled;
        IERC721(listing.token).transferFrom(
            address(this),
            listing.seller,
            listing.tokenID
        );
    }

    function listItemOnAuction(
        address _token,
        uint256 _tokenID,
        uint256 bidPrice
    ) public {
        address owner = IERC721(_token).ownerOf(_tokenID);
        require(owner == msg.sender);
        IERC721(_token).transferFrom(msg.sender, address(this), _tokenID);
        auctions[auctionID] = Auction({
            seller: msg.sender,
            token: _token,
            tokenID: _tokenID,
            bidPrice: bidPrice,
            bidCount: 0,
            auctionStartTime: block.timestamp,
            auctionEndTime: block.timestamp + 3 days,
            lastBidder: address(0),
            status: Status.Active
        });
    }

    function makeBid(uint256 _auctionID) public payable {
        Auction storage auction = auctions[_auctionID];
        biddersPrice[msg.sender] += msg.value;
        uint256 countArr = 0;
        require(
            biddersPrice[msg.sender] > auction.bidPrice,
            "bid should be more then current price"
        );
        require(auction.seller == msg.sender, "not an owner");
        auction.bidPrice = biddersPrice[msg.sender];
        auction.bidCount++;
        auction.lastBidder = msg.sender;
        for (uint256 i = 0; i < biddersArr.length; i++) {
            if (msg.sender == biddersArr[i]) {
                countArr++;
            }
        }
        if (countArr++ == 0) {
            biddersArr.push(msg.sender);
        }
    }

    function finishAuction(uint256 _auctionID) public payable {
        Auction storage auction = auctions[_auctionID];
        require(auction.seller == msg.sender, "not an owner");
        require(block.timestamp > auction.auctionEndTime, "time isn't over");
        if (auction.bidCount < 2) {
            for (uint256 i = 0; i < biddersArr.length; i++) {
                payable(biddersArr[i]).transfer(biddersPrice[biddersArr[i]]);
            }
            IERC721(auction.token).transferFrom(
                address(this),
                auction.seller,
                auction.tokenID
            );
        } else {
            IERC721(auction.token).transferFrom(
                address(this),
                auction.lastBidder,
                auction.tokenID
            );
            payable(auction.seller).transfer(auction.bidPrice);

            for (uint256 i = 0; i < biddersArr.length; i++) {
                if (biddersArr[i] != auction.lastBidder) {
                    payable(biddersArr[i]).transfer(
                        biddersPrice[biddersArr[i]]
                    );
                }
            }
        }
    }

    function cancelAuction(uint256 _auctionID) public payable {
        Auction storage auction = auctions[_auctionID];
        require(auction.seller == msg.sender, "not an owner");
        IERC721(auction.token).transferFrom(
            address(this),
            auction.seller,
            auction.tokenID
        );
        for (uint256 i = 0; i < biddersArr.length; i++) {
            payable(biddersArr[i]).transfer(biddersPrice[biddersArr[i]]);
        }
    }
}
