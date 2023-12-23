const { ethers } = require("hardhat");
Web3 = require('web3');
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const fs = require("fs");

async function main() {
    
	  const qrc20Address = "0xb72c27a104Cf926075C1Bd43406f75F783E01499"
    const QRC20 = await ethers.getContractFactory("QRC20");
    const contract = QRC20.attach(qrc20Address);

    // Merkle Root
    let addresses = [
      {
          addr: "0x43bE1FCEeddeD2d2885f58b26C7444314b31664d",
      },
      {
          addr: "0x7afe4313D301616526944F5C6A7764bF62FF5eBE"
      
      },
      ];
  
      const leafNodes = addresses.map((address) =>
      keccak256(
         Buffer.from(address.addr.replace("0x", ""), "hex"),
      
      )
      );
  
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

      root = merkleTree.getHexRoot();

      const data = {
        addresses: addresses.map((address) => address.addr),
        leafNodes: leafNodes,
        root: root,
      };

      fs.writeFileSync("tree.json", JSON.stringify(data, null, 2));
    

      console.log("Deploying Airdrop V1...");

      const AirDropV1 = await ethers.getContractFactory("AirDropV1");
     //  console.log("AirDropV1 contract: ", AirDropV1)
      

      const dropAmt = Web3.utils.toWei('20', 'ether')
      const airdrop = await AirDropV1.deploy();

      await airdrop.waitForDeployment();

      console.log("AirdropV1 deployed to:", await airdrop.getAddress())
      await airdrop.create_airdrop(qrc20Address,dropAmt,root)

      console.log("Funding the Airdrop");

      //mint token
      const airdropAddress = airdrop.getAddress();
      const mintAmount = Web3.utils.toWei('2000', 'ether');
      await contract.mintTo(airdropAddress, mintAmount);
      console.log("Airdrop Funded...");
  } 

  main();
