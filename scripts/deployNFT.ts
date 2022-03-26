import { ethers } from "hardhat";

async function main() {
    const [owner] = await ethers.getSigners();
    const NFT721 = await ethers.getContractFactory("NFT");
    const nft = await NFT721.deploy();
    await nft.deployed();
    console.log("adress is " + nft.address)
    console.log("deployed by " + owner.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});