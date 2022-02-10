import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// //таск для проверки баланса контракта в сети Rinkeby
// //npx hardhat rBalance --address <contract address> --network rinkeby
// task("balance", "Shows balance of the conrtact deployed on Rinkeby")
//   .addParam("address", "The contract address on Rinkeby")
//   .setAction(async (taskArgs, hre) => {
//     const contract = await hre.ethers.getContractAt("NFTMarket", taskArgs.address)
//     const balance = await contract.getBalance()
//     console.log(hre.ethers.utils.formatEther(balance), "ETH")
//   });


//npx hardhat aprove --address 0x0d04Be8a34282b93c552dbBbEFB5Cf7dFD5300E3 --addressto 0x149E6e85b6D9b32702f2a14cB1A4817BA19Ede20 --tokenid 0
//npx hardhat rBalance --address <contract address> --network rinkeby
task("aprove", "aproving transfer opportunity")
  .addParam("address", "The contract address on Rinkeby")
  .addParam("addressto", "To whom")
  .addParam("tokenid", "id of NFT")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("NFT", taskArgs.address)
    await contract.approve(taskArgs.addressto, taskArgs.tokenid)
    //console.log(await contract.getApproved(taskArgs.tokenid))
    console.log(await contract.balanceOf("0x7e670e2807f96a6df5f936ec37ff92595cefa3e4"))

  });

//npx hardhat balance --address 0x0d04Be8a34282b93c552dbBbEFB5Cf7dFD5300E3
task("balance", "aproving transfer opportunity")
  .addParam("address", "The contract address on Rinkeby")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("NFT", taskArgs.address)
    try {
      console.log(await contract.balanceOf("0x7E670e2807F96a6df5F936Ec37ff92595CEFA3E4"))
    } catch (error) {
      console.log(error)
    };

  });

//npx hardhat list --address 0x149E6e85b6D9b32702f2a14cB1A4817BA19Ede20 --addresstoken 0x0d04Be8a34282b93c552dbBbEFB5Cf7dFD5300E3 --tokenid 0 --price 1000  --network rinkeby
task("list", "listing")
  .addParam("address", "The contract address on Rinkeby")
  .addParam("addresstoken", "Token addres")
  .addParam("tokenid", "id of NFT")
  .addParam("price", "price")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("NFTMarket", taskArgs.address)
    const balance = await contract.listItem(taskArgs.addresstoken, taskArgs.tokenid, taskArgs.price)

  });


// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};


// module.exports = {
//   solidity: "0.8.4",
//   networks: {
//     rinkeby: {
//       url: process.env.RINKEBY_URL || "",
//       accounts:
//         process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
//     },
//   },
//   etherscan: {
//     // Your API key for Etherscan
//     // Obtain one at https://etherscan.io/
//     apiKey: process.env.ETHERSCAN_API_KEY,
//   }
// };
export default config;
