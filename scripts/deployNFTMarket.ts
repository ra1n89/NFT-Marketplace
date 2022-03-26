import { ethers } from "hardhat";

async function main() {
    const [owner] = await ethers.getSigners();
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    console.log("adress is " + nftMarket.address)
    console.log("deployed by " + owner.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

