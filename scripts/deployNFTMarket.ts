import { ethers } from "hardhat";

async function main() {
    const [owner] = await ethers.getSigners();
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    console.log("adress is " + nftMarket.address)
    console.log("deployed by " + owner.address)
    //const tnx = await nftMarket.listItem("0x9D5b76e751304dD9dee74ad15E5d1858f6AE9F7d", 0, 10000000000)
    // await tnx.wait();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

