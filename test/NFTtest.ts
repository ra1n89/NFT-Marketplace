import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { providers } from "ethers";
import { ethers, network } from "hardhat";
import { NFT, NFTMarket, NFTMarket__factory, NFT__factory } from "../typechain";


describe("NFTMarket", function () {
  let seller: SignerWithAddress,
    pete: SignerWithAddress,
    tony: SignerWithAddress,
    alice: SignerWithAddress;
  let nftMarket: NFTMarket;
  let nft: NFT;
  const uri = "https: //ipfs.io/ipfs/QmTE9QLXSmZD2vuFxUyAuTENJqN45jddpPkxeJuD4aqDgV";


  before(async () => {
    [seller, alice, pete, tony] = await ethers.getSigners();
  })

  beforeEach(async () => {
    const NFTMarket = await ethers.getContractFactory("NFTMarket") as NFTMarket__factory;
    nftMarket = await NFTMarket.deploy() as NFTMarket;
    await nftMarket.deployed();
    //Deploy NFT
    const NFT = await ethers.getContractFactory("NFT") as NFT__factory;
    nft = await NFTMarket.deploy() as NFT;
    await nft.deployed();
    //Mint first NFT
    await nft.mint(uri, seller.address);
    await nft.approve(nftMarket.address, 0);
  })

  it("createItem: ", async function () {
    const uri = "https: //ipfs.io/ipfs/QmTE9QLXSmZD2vuFxUyAuTENJqN45jddpPkxeJuD4aqDgV";
    await nftMarket.createItem(uri);
    console.log(await nftMarket.balanceOf(seller.address));
    //await nft.ownerOf(1);
  })

  //listItem() requre
  //listItem() listingID добавить проверку

  it("listItem(): should transfer NFT to NFTMarket from Seller", async function () {
    const tokenID = 0;
    const price = 1000;
    expect(await nft.balanceOf(seller.address)).to.be.equal(1)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
    await nftMarket.listItem(nft.address, tokenID, price)
    expect(await nft.balanceOf(seller.address)).to.be.equal(0)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(1)
    console.log(await nft.balanceOf(nftMarket.address))
  })

  it("listItem(): should transfer NFT to NFTMarket from Seller", async function () {
    const tokenID = 0;
    const price = 1000;

    await expect(nftMarket.connect(alice).listItem(nft.address, tokenID, price)).to.be.revertedWith("only owner can list token");
    console.log(await nft.balanceOf(nftMarket.address))
  })

  it("buyItem(): should revert is not listed", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItem(nft.address, tokenID, price)
    await nftMarket.cancelListing(tokenID)
    await expect(nftMarket.buyItem(tokenID)).to.be.revertedWith("Isn't listed")
  })

  it("buyItem(): should revert if caller is owner", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItem(nft.address, tokenID, price)
    await expect(nftMarket.buyItem(tokenID)).to.be.revertedWith("Owner can't buy his token")
  })


  it("buyItem(): should revert if caller sends less money than price", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItem(nft.address, tokenID, price)
    await expect(nftMarket.connect(alice).buyItem(0, { value: 500 })).to.be.revertedWith("Isn't enought money to buy");
  })

  it("buyItem(): NFT should transfer NFT to Alice from Market", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItem(nft.address, tokenID, price)
    expect(await nft.balanceOf(seller.address)).to.be.equal(0)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(1)
    await nftMarket.connect(alice).buyItem(0, { value: ethers.utils.parseUnits("100") });
    expect(await nft.balanceOf(seller.address)).to.be.equal(0)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
    expect(await nft.balanceOf(alice.address)).to.be.equal(1)
  })


  it("cancelListing(): should revert if caller not an owner", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItem(nft.address, tokenID, price)
    await expect(nftMarket.connect(alice).cancelListing(0)).to.be.revertedWith("not owner")
  })

  it("cancelListing(): should transfer NFT back to Seller from Market", async function () {
    const tokenID = 0;
    const price = 1000;
    //console.log(ethers.utils.formatEther(await alice.getBalance()))
    await nftMarket.listItem(nft.address, tokenID, price)
    await nftMarket.cancelListing(0)
    expect(await nft.balanceOf(seller.address)).to.be.equal(1)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
    expect(await nft.balanceOf(alice.address)).to.be.equal(0)
  })

  it("listItemOnAuction(): should transfer NFT from Seller to Market", async function () {
    const tokenID = 0;
    const price = 1000;
    await expect(nftMarket.connect(alice).listItemOnAuction(nft.address, tokenID, price)).to.be.revertedWith("not an owner")

  })

  it("makeBid(): should transfer NFT from Seller to Market", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
  })

  it("makeBid(): should transfer NFT from Seller to Market", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
    await expect(nftMarket.connect(pete).makeBid(0, { value: ethers.utils.parseUnits("1") })).to.be.revertedWith("bid should be more then current price")
  })

  it("finishAuction():  should revert if caller not an owner", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
    await nftMarket.connect(pete).makeBid(0, { value: ethers.utils.parseUnits("2") })
    await expect(nftMarket.connect(alice).finishAuction(0)).to.be.revertedWith("not an owner")
  })

  it("finishAuction():  should revert if time isn't over", async function () {
    const timeLock = (3 * 24 * 60 * 60) - 100;
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
    await nftMarket.connect(pete).makeBid(0, { value: ethers.utils.parseUnits("2") })
    await network.provider.send("evm_increaseTime", [timeLock]);
    await network.provider.send("evm_mine");
    await expect(nftMarket.finishAuction(0)).to.be.revertedWith("time isn't over")
  })


  it("finishAuction(): should transfer NFT from Market back to Seller (timelock is over, bids are equal or less than 2)", async function () {
    const timeLock = 3 * 24 * 60 * 60;
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
    await nftMarket.connect(pete).makeBid(0, { value: ethers.utils.parseUnits("2") })
    await network.provider.send("evm_increaseTime", [timeLock]);
    await network.provider.send("evm_mine");
    await nftMarket.finishAuction(0);
    expect(await nft.balanceOf(seller.address)).to.be.equal(1)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)

  })

  it("finishAuction(): should transfer NFT from Market to winner(Tony) (timelock is over, bids  more than 2)", async function () {
    const timeLock = 3 * 24 * 60 * 60;
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.connect(alice).makeBid(0, { value: ethers.utils.parseUnits("1") })
    await nftMarket.connect(pete).makeBid(0, { value: ethers.utils.parseUnits("2") })
    await nftMarket.connect(tony).makeBid(0, { value: ethers.utils.parseUnits("3") })
    await network.provider.send("evm_increaseTime", [timeLock]);
    await network.provider.send("evm_mine");
    await nftMarket.finishAuction(0);
    expect(await nft.balanceOf(seller.address)).to.be.equal(0)
    expect(await nft.balanceOf(pete.address)).to.be.equal(0)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
    expect(await nft.balanceOf(tony.address)).to.be.equal(1)

  })

  it("cancelAuction():  should revert if caller not an owner", async function () {

    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await expect(nftMarket.connect(alice).cancelAuction(0)).to.be.revertedWith("not an owner");
  })


  it("cancelAuction(): should transfer NFT from Market back to Seller", async function () {
    const tokenID = 0;
    const price = 1000;
    await nftMarket.listItemOnAuction(nft.address, tokenID, price)
    await nftMarket.cancelAuction(0);
    expect(await nft.balanceOf(seller.address)).to.be.equal(1)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
  })
















})




