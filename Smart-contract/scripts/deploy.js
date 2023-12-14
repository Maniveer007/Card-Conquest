
const hre = require("hardhat");

async function main() {
  const {ACCOUNT_1_PRIVATE_KEY}=process.env

  const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

  alice= new ethers.Wallet(ACCOUNT_1_PRIVATE_KEY,provider)

  if(Number(await provider.getBalance(alice.address))<1 *10**9){
    console.log('funded alice');
    await execute(`docker exec -i fhevm faucet ${alice.address}`)
  }
    const CardConquest = await hre.ethers.getContractFactory("Card_Conquest",alice);


    alicecontract = await CardConquest.deploy();   

    console.log(`contract is deployed at address:${alicecontract.address}`);
}


 

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.log(error);
  console.error(error);
  process.exitCode = 1;
});
