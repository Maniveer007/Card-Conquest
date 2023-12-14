const {expect} =require('chai')
const {  exec  } = require('child_process');
const { promisify } = require('util');
const execute = promisify(exec);
const { ethers } = require('ethers');

const hre = require("hardhat");


const fhevmjs =require('fhevmjs')


describe("Card conquest contract",function(){

    it("initalising signer ",async function (){
       const {ACCOUNT_1_PRIVATE_KEY,ACCOUNT_2_PRIVATE_KEY}=process.env

       const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

        this.alice= new ethers.Wallet(ACCOUNT_1_PRIVATE_KEY,provider)
        this.bob= new ethers.Wallet(ACCOUNT_2_PRIVATE_KEY,provider)
        
    if(Number(await provider.getBalance(this.alice.address))<1 *10**9){
        console.log('funded alice');
        await execute(`docker exec -i fhevm faucet ${this.alice.address}`)
    }
    if(Number(await provider.getBalance(this.bob.address))<1*10**9){
        console.log('funded Bob');
        await execute(`docker exec -i fhevm faucet ${this.bob.address}`)
    }
    })

    it("deploying contract",async function(){

        const CardConquest = await hre.ethers.getContractFactory("Card_Conquest",this.alice);

         this.alicecontract = await CardConquest.deploy();      

        this.bobcontract=this.alicecontract.connect(this.bob)
    })

    it("registering alice and bob",async function(){
        

        const txalice=await this.alicecontract.registerPlayer("alice","alice",{gasLimit:1000000})
        await txalice.wait()
        

        const txbob=await this.bobcontract.registerPlayer("bob","bob",{gasLimit:1000000})
        await txbob.wait()


    })

    it('alice create battle bob will join it ', async function(){
        
        const txcreate=await this.alicecontract.createBattle("aliceVSbob")
        await txcreate.wait();

        const txjoin=await this.bobcontract.joinBattle("aliceVSbob");
        await txjoin.wait()
    })

    it("setting up this.instance",async function (){

        const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

        const network = await provider.getNetwork();

        const chainId = Number(network.chainId)


        const publicKey = await provider.call({
            to: '0x0000000000000000000000000000000000000044',            
          });
          

         this.instance= await fhevmjs.createInstance({chainId,publicKey})
         this.token=this.instance.generateToken({verifyingContract: this.alicecontract.address})
    })

    it("alice is attacking and bob is attacking",async function (){
        let alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        let bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        let alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        let bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        let aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        let bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(10);
        expect(bobMana).to.equal(10);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);
        
        const txalice=await this.alicecontract.attackOrDefendChoice(1,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await this.bobcontract.attackOrDefendChoice(1,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);

    })
    it("alice is attacking and bob is defending",async function (){
        let alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        let bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        let alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        let bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        let aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        let bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(7);
        expect(bobMana).to.equal(7);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await this.alicecontract.attackOrDefendChoice(1,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await this.bobcontract.attackOrDefendChoice(2,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(4);
        expect(bobMana).to.equal(10);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);
    })

    it("reject alice transaction due to lower Mana",async function(){
        const txalice=await this.alicecontract.attackOrDefendChoice(1,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await this.bobcontract.attackOrDefendChoice(1,"aliceVSbob")
        await txbob.wait()

       const txrejected= await this.alicecontract.attackOrDefendChoice(1,"aliceVSbob")
    //    await rjectedtx.wait()
        await expect(txrejected.wait()).to.be.rejected
    })
    it("alice is defending and bob is attacking",async function (){
        let alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        let bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        let alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        let bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        let aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        let bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(1);
        expect(bobMana).to.equal(7);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await this.alicecontract.attackOrDefendChoice(2,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await this.bobcontract.attackOrDefendChoice(1,"aliceVSbob")
        await txbob.wait()
        
        alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(4);
        expect(bobMana).to.equal(4);

       console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
       console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);

    })
    it("alice is defending and bob is defending",async function (){
        let alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
        let bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

        let alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
        let bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
        let aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
        let bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

        expect(aliceMana).to.equal(4);
        expect(bobMana).to.equal(4);

        console.log(`alice health before :${alicehealth} bobhealth before:${bobhealth}`);
        console.log(`alice Mana before :${aliceMana} bobMana before:${bobMana}`);

        const txalice=await this.alicecontract.attackOrDefendChoice(2,"aliceVSbob")
        await txalice.wait()
        
        const txbob=await this.bobcontract.attackOrDefendChoice(2,"aliceVSbob")
        await txbob.wait()
        
         alicedetails=await this.alicecontract.getPlayerOut(this.alice.address,this.token.publicKey)   
         bobdetails=await this.bobcontract.getPlayerOut(this.bob.address,this.token.publicKey)

         alicehealth=this.instance.decrypt(this.alicecontract.address,alicedetails[3])
         bobhealth=this.instance.decrypt(this.bobcontract.address,bobdetails[3])
         aliceMana=this.instance.decrypt(this.alicecontract.address,alicedetails[2])
         bobMana=this.instance.decrypt(this.bobcontract.address,bobdetails[2])

         expect(aliceMana).to.equal(7);
         expect(bobMana).to.equal(7);

        console.log(`alice health after :${alicehealth} bobhealth after:${bobhealth}`);
        console.log(`alice Mana after :${aliceMana} bobMana after:${bobMana}`);
    })

    






})