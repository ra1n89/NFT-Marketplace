import { ethers } from "hardhat";

async function main() {
    const [owner] = await ethers.getSigners();
    const NFT721 = await ethers.getContractFactory("NFT");
    const nft = await NFT721.deploy();
    await nft.deployed();
    console.log("adress is " + nft.address)
    console.log("deployed by " + owner.address)
    const tnx = await nft.mint("https://ipfs.io/ipfs/QmTE9QLXSmZD2vuFxUyAuTENJqN45jddpPkxeJuD4aqDgV")
    //await tnx.wait();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//0x0d04Be8a34282b93c552dbBbEFB5Cf7dFD5300E3