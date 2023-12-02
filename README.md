
# Card Conquest: A Tactical Duel

Card Conquest is a Fully onchain Multiplayer game Unlocks abilty to Battle with other players in real-time with interactive user experience . uses fully homomorphic encryption to ensure the security and privacy on Public blockchain's




## Tech Stack


- Node.js
- Ethersjs
- Solidity
- Docker
- ZAMA's Devnet





## Run Locally

Clone the project

```bash
  https://github.com/Maniveer007/Card-Conquest
```

Go to the project directory

```bash
  cd Card-Conquest
```

Install dependencies

```bash
  npm install
```

Start the Game

```bash
  npm run dev
```




## Game Rules


- Card with the same defense and attack point will cancel each other out
 - Attack points from the attacking card will deduct the opposing player’s health points.
  - If P1 does not defend, their health wil be deducted by P2’s attack.
 - If P1 defends, P2’s attack will be equal to P2’s attack - P1’s defense.
 - If a player defends, they refill 3 Mana,
 - If a player attacks, they spend 3 Mana,


 
## UI

To read more about user experience take a look of README.md in Card-Conquest
 

![Gameplay](https://i.ibb.co/27D9SDT/l.png)




## ZAMA's fhevm


Bring confidential smart contracts to your blockchain with Zama's fhEVM

There used to be a dilemma in blockchain: keep your application and user data on-chain, allowing everyone to see it, or keep it privately off-chain and lose contract composability. Thanks to a breakthrough in homomorphic encryption, Zama’s fhEVM makes it possible to run confidential smart contracts on encrypted data, guaranteeing both confidentiality and composability.


## TFHE Solidity library

The TFHE Solidity library we introduce is a powerful tool that empowers developers to manipulate encrypted data using TFHE within smart contracts. With this library, developers can perform computations over encrypted data, such as addition, multiplication, comparison and more, while maintaining the confidentiality of the underlying information.#   C a r d - C o n q u e s t  
 