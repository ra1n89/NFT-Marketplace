import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT, NFTMarket, NFTMarket__factory, NFT__factory } from "../typechain";


describe("NFTMarket", function () {
  let seller: SignerWithAddress,
    alice: SignerWithAddress;
  let nftMarket: NFTMarket;
  let nft: NFT;
  const uri = "https: //ipfs.io/ipfs/QmTE9QLXSmZD2vuFxUyAuTENJqN45jddpPkxeJuD4aqDgV";


  before(async () => {
    [seller, alice] = await ethers.getSigners();
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
    await nft.mint(uri);
    await nft.approve(nftMarket.address, 0);
  })

  it("Name is correct", async function () {
    const tokenID = 0;
    console.log(await nft.tokenURI(tokenID));
  })

  it("listItem(): NFT should transfer to NFTMarket from Seller", async function () {
    const tokenID = 0;
    const price = 1000;
    expect(await nft.balanceOf(seller.address)).to.be.equal(1)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(0)
    await nftMarket.listItem(nft.address, tokenID, price)
    expect(await nft.balanceOf(seller.address)).to.be.equal(0)
    expect(await nft.balanceOf(nftMarket.address)).to.be.equal(1)
    console.log(await nft.balanceOf(nftMarket.address))
  })
})

