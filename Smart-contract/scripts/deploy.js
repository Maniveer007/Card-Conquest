const {  exec  } = require('child_process');
const { promisify } = require('util');
const execute = promisify(exec);
const { ethers } = require('ethers');
const hre = require("hardhat");

async function main() {


  const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

  const waitForBalance = async (address) => {
    return new Promise((resolve, reject) => {
      const checkBalance = async () => {
        const balance = Number(await provider.getBalance(address));
        if (balance > 0) {
          await provider.off('block', checkBalance);
          resolve();
        }
      };
       provider.on('block', checkBalance)
    });
  };

   this.alice=new ethers.Wallet.createRandom().connect(provider)

  if(Number(await provider.getBalance(this.alice.address))==0){
    console.log('funded alice');
    await execute(`docker exec -i fhevm faucet ${this.alice.address}`)
    await waitForBalance(this.alice.address)
  }
    const CardConquest = await hre.ethers.getContractFactory("Card_Conquest",this.alice);


    this.alicecontract = await CardConquest.deploy();   

    console.log(`contract is deployed at address:${this.alicecontract.address}`);
}


 

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.log(error);
  console.error(error);
  process.exitCode = 1;
});
