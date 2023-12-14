const {expect} =require('chai')
const {  exec  } = require('child_process');
const { promisify } = require('util');
const execute = promisify(exec);
const { ethers } = require('ethers');

const hre = require("hardhat");


const fhevmjs =require('fhevmjs')
// const { ethers } = require('hardhat')
// const { ethers } = require('hardhat')
// ethers

describe("Card conquest contract",function(){
    let alice,bob
    let alicecontract,bobcontract;
    const gasLimit = 1000000;
    let instance,publicKey,token
    it("initalising signer ",async function (){
       const {ACCOUNT_1_PRIVATE_KEY,ACCOUNT_2_PRIVATE_KEY}=process.env

       const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

        alice= new ethers.Wallet(ACCOUNT_1_PRIVATE_KEY,provider)
        bob= new ethers.Wallet(ACCOUNT_2_PRIVATE_KEY,provider)
        
    if(Number(await provider.getBalance(alice.address))<1 *10**9){
        console.log('funded alice');
        await execute(`docker exec -i fhevm faucet ${alice.address}`)
    }
    if(Number(await provider.getBalance(bob.address))<1*10**9){
        console.log('funded Bob');
        await execute(`docker exec -i fhevm faucet ${bob.address}`)
    }
    })

    it("deploying contract",async function(){

        const CardConquest = await hre.ethers.getContractFactory("Card_Conquest",alice);


         alicecontract = await CardConquest.deploy();      

        bobcontract=alicecontract.connect(bob)
    })

    it("registering alice and bob",async function(){
        
        const txrandom =await alicecontract.random({gasLimit});
        await txrandom.wait();

        const txalice=await alicecontract.registerPlayer("alice","alice",{gasLimit})
        await txalice.wait()
        

        const txbob=await bobcontract.registerPlayer("alice","alice",{gasLimit})
        await txbob.wait()

        // await Promise.all([txalice.wait,txbob.wait])
        // done()
    })

    it('alice create battle bob will join it ', async function(){
        
        const txcreate=await alicecontract.createBattle("aliceVSbob",{gasLimit})
        await txcreate.wait();

        // await new Promise(resolve => setTimeout(resolve, 10000));

        const txjoin=await bobcontract.joinBattle("aliceVSbob",{gasLimit});
        await txjoin.wait()
        // done()
    })

    it("setting up instance",async function (){

        const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

        const network = await provider.getNetwork();

        const chainId = Number(network.chainId)


        publicKey = await provider.call({
            to: '0x0000000000000000000000000000000000000044',
            // data: '0xd9d47bb001',
            
          });
          

         instance= await fhevmjs.createInstance({chainId,publicKey})
         token=instance.generateToken({verifyingContract: alicecontract.address})
    })

    it("alice is attacking and bob is attacking",async function (){
        let alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        let bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        let alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        let bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        let aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        let bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(10);
        expect(bobMana).to.equal(10);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);
        
        const txalice=await alicecontract.attackOrDefendChoice(1,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await bobcontract.attackOrDefendChoice(1,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);

    })
    it("alice is attacking and bob is defending",async function (){
        let alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        let bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        let alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        let bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        let aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        let bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await alicecontract.attackOrDefendChoice(1,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await bobcontract.attackOrDefendChoice(2,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(4);
        expect(bobMana).to.equal(10);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);
    })
    it("alice is defending and bob is attacking",async function (){
        let alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        let bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        let alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        let bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        let aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        let bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(4);
        expect(bobMana).to.equal(10);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await alicecontract.attackOrDefendChoice(2,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await bobcontract.attackOrDefendChoice(1,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);

    })
    it("alice is defending and bob is defending",async function (){
        let alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
        let bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

        let alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
        let bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
        let aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
        let bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await alicecontract.attackOrDefendChoice(2,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await bobcontract.attackOrDefendChoice(2,"aliceVSbob")
        await txbob.wait()
        
         alicedetails=await alicecontract.getPlayerOut(alice.address,token.publicKey)   
         bobdetails=await bobcontract.getPlayerOut(bob.address,token.publicKey)

         alicehealth=instance.decrypt(alicecontract.address,alicedetails[3])
         bobhealth=instance.decrypt(bobcontract.address,bobdetails[3])
         aliceMana=instance.decrypt(alicecontract.address,alicedetails[2])
         bobMana=instance.decrypt(bobcontract.address,bobdetails[2])

         expect(aliceMana).to.equal(10);
         expect(bobMana).to.equal(10);

        console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
        console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);
    })

    






})