//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFT.sol";

/** @title NFT marketplace
 * @dev users can place order for sale or create auction for NFT tokens, and other users can buy them
 * @author Rishat Akhmetzyanov
 * @notice not for using in real projects beacause it's not properly audited
 */
contract NFTMarket is NFT {
    uint256 private listingID = 0;
    uint256 public auctionID = 0;

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

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) private biddersPrice;
    address[] private biddersArr;

    function createItem(string memory _tokenURI) public returns (bool) {
        NFT.mint(_tokenURI, msg.sender);
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
        payable(listing.seller).transfer(listing.price);

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
        require(owner == msg.sender, "not an owner");
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
        if (auction.bidCount <= 2) {
            for (uint256 i = 0; i < biddersArr.length; i++) {
                payable(biddersArr[i]).transfer(biddersPrice[biddersArr[i]]);
            }
            IERC721(auction.token).transferFrom(
                address(this),
                auction.seller,
                auction.tokenID
            );
            auction.status = Status.Canceled;
        } else {
            IERC721(auction.token).transferFrom(
                address(this),
                auction.lastBidder,
                auction.tokenID
            );
            auction.status = Status.Sold;
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
        auction.status = Status.Canceled;
    }
}
