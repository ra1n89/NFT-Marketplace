# NFT Marketplace

This project implements NFT Marketplace, which allows users to place order for sale or create auction for NFT tokens, and other users can buy them

### Basic functions:

function createItem() - create new NFT 
function listItem() - place NFT for sale  
function buyItem() - any user can pay order and buy NFT  
function cancel() - canceling order  
function listItemOnAuction() - place NFT in auction for 3 days  
function makeBid() - any user can make a bid in auction  
function finishAuction() - after 3 days anyone can finish auction  
function cancelAuction() - only owner can cancel auction  


Verified contract:
https://rinkeby.etherscan.io/address/0xa319D38927d2df62c392AEb1d2a1daFaE2967585#code

Create a .env file using this template in env.example
```
ETHERSCAN_API_KEY=
RINKEBY_URL=
PRIVATE_KEY=
ALCHEMY_API_KEY=
```
P.S. not for using in real projects beacause it's not audited
