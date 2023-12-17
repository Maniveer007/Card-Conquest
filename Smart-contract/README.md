
## Run Hardhat Project

Run Docker Image Locally for local development

```
docker run -i -p 8545:8545 --rm --name fhevm ghcr.io/zama-ai/evmos-dev-node:v0.1.10
```

Install dependencies

```
npm install
```

compile Contract
```
npx hardhat compile
```

deploy Contract

```
npx hardhat run scripts/deploy.js
```

run Tests 
```
npx hardhat test
```

**This smart contract facilitates a two-player card battle game with strategic elements and privacy features**.

## Key Features:

- **On-chain game logic**: Ensures fair and transparent gameplay.
- **FhEVM integration**: Encrypts player choices (attack/defend) until revealed.
- **Multiple game elements**: Attack strength, defense strength, player mana, health.
- **Randomized card attributes**: Adds replayability and strategic depth.


## Contract Structure:

**Data Structures**:
- GameToken: Stores information about a player's battle card.
- Player: Stores information about a player.
- Battle: Stores information about a battle between two players.
**Mappings**:
- playerInfo: Maps player address to player index.
- playerTokenInfo: Maps player address to game token index.
- battleInfo: Maps battle name to battle index.
**Arrays**:
- players: Stores all players.
- gameTokens: Stores all game tokens.
- battles: Stores all battles.
**Functions**:
- Registration: Players register with a name and receive a battle card.
- Battle creation: A player creates a battle with a name and waits for another player to join.
- Joining a battle: A second player joins an existing battle.
Attack/Defend choice: Players choose to attack or defend with their battle card.
- Battle resolution: After both players have chosen, the battle is resolved and a winner is declared.
**Privacy Considerations**:

Player choices are encrypted using fhEVM until revealed.
Game tokens only reveal encrypted attack and defense strength values.
Player health and mana are also encrypted.
Security Features:

Smart contracts are tamper-proof and secure.

All game data is recorded on the blockchain for transparency.
Future Potential:

Integration with other on-chain applications and marketplaces.
Development of new game modes and features.
Increased scalability to accommodate a larger number of players.
Overall, the Card_Conquest smart contract provides a secure and engaging platform for on-chain card battle games.
## Game Flow:

**1.registerPlayer**:

Assign Player With PlayerCard With Initally 25 Health and 10 Mana

```
    players.push(Player(msg.sender, _name, TFHE.asEuint8(10), TFHE.asEuint8(25), false)); // Adds player to players array
    playerInfo[msg.sender] = _id; // Creates player info mapping
```

**2.createBattle**

initialize Match With 1 Player in Match and waiting for other player to join

```
    Battle memory _battle = Battle(
      BattleStatus.PENDING, // Battle pending
      battleHash, // Battle hash
      _name, // Battle name
      [msg.sender, address(0)], // player addresses; player 2 empty until they joins battle
      [0, 0], // moves for each player
      address(0) // winner address; empty until battle ends
    );

    uint256 _id = battles.length;
    battleInfo[_name] = _id;
    battles.push(_battle);
```

**3.joinBattle**

Player will join the Battle
and Player State will be set to true

```
    players[playerInfo[_battle.players[0]]].inBattle = true;
    players[playerInfo[_battle.players[1]]].inBattle = true;
```

**4.attackOrDefendChoice**

If a players choice is registered and if both player makes move then the Battle result is calculated

```
    _registerPlayerMove(_battle.players[0] == msg.sender ? 0 : 1, _choice, _battleName);

    _battle = getBattle(_battleName);
    uint _movesLeft = 2 - (_battle.moves[0] == 0 ? 0 : 1) - (_battle.moves[1] == 0 ? 0 : 1);
    emit BattleMove(_battleName, _movesLeft == 1 ? true : false); 
    
    if(_movesLeft == 0) {
      _awaitBattleResults(_battleName);
    }
```

**5._awaitBattleResults**

If both player chooses attack we will check If any player wins and changes Currentplayer Health and Mana

```
      isplayer1winner=TFHE.ge(p1.attack , p2.health);
      TFHEwinner=TFHE.cmux(isplayer1winner,TFHE.asEuint8(1),TFHEwinner); // check is player1 won the Battle
      isplayer2winner=TFHE.ge(p2.attack , p1.health);
      TFHEwinner=TFHE.cmux(isplayer2winner,TFHE.asEuint8(2),TFHEwinner); // check is player2 won the Battle

      ebool nowinner=TFHE.eq(TFHEwinner,0); // check no player won the Battle

        // Update Health of players
        players[p1.index].playerHealth =TFHE.cmux(nowinner,players[p1.index].playerHealth- p2.attack,players[p1.index].playerHealth);
        players[p2.index].playerHealth =TFHE.cmux(nowinner,players[p2.index].playerHealth-p1.attack,players[p2.index].playerHealth);
       
        // Update Mana of players
        players[p1.index].playerMana =TFHE.cmux(nowinner,TFHE.sub(players[p1.index].playerMana,3),players[p1.index].playerMana);
        players[p2.index].playerMana =TFHE.cmux(nowinner,TFHE.sub(players[p2.index].playerMana,3),players[p2.index].playerMana);
        

        // Both player's health damaged
        _damagedPlayers = _battle.players;
```

if player 1 choose attack and player2 choose Defence we will check whether player1 wins and Assign player2 health will be decreased
if player1's attack id greater than player2's defence then player2 health decreaced by the deference else remains unchanged

```
      euint8 PHAD = p2.health + p2.defense;
      isplayer1winner=TFHE.ge(p1.attack , PHAD);
      TFHEwinner=TFHE.cmux(isplayer1winner,TFHE.asEuint8(1),TFHEwinner);

        euint8 healthAfterAttack; // Assigns Health after attack of Player1
        
          healthAfterAttack = TFHE.cmux(TFHE.gt(p2.defense , p1.attack),p2.health,PHAD - p1.attack);

          // Player 2 health damaged
          _damagedPlayers[0] = _battle.players[1];

        players[p2.index].playerHealth = healthAfterAttack;
        // Update Mana of players
        players[p1.index].playerMana =TFHE.sub(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.add(players[p2.index].playerMana,3) ;
       
```
if player2 choose attack and player1 choose Defence we will check whether player2 wins and Assign player1 health will be decreased
if player2's attack id greater than player1's defence then player1 health decreaced by the deference else remains unchanged
```
      euint8 PHAD = p1.health + p1.defense;
      isplayer2winner=TFHE.ge(p2.attack , PHAD);
      TFHEwinner=TFHE.cmux(isplayer2winner,TFHE.asEuint8(2),TFHEwinner);

        euint8 healthAfterAttack; // Assigns Health after attack of Player2
        
         healthAfterAttack = TFHE.cmux(TFHE.gt(p1.defense , p2.attack),p1.health,PHAD - p2.attack);

          // Player 1 health damaged
          _damagedPlayers[0] = _battle.players[0];
        

        players[p1.index].playerHealth = healthAfterAttack;

        // Update Mana of players
        players[p1.index].playerMana =TFHE.add(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.sub(players[p2.index].playerMana,3) ;
```

if Both Player choose Defence their Mana will be increased By 3

```
        players[p1.index].playerMana =TFHE.add(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.add(players[p2.index].playerMana,3) ;
```

after every round we reset players Card 
```
    // Reset random attack and defense strength

    euint8 rand=TFHE.randEuint8();
    // we take first 3 bits of random number to calculate random Defence Strength of Player1
    euint8 randDefenceStrength1=TFHE.and(rand,TFHE.asEuint8(7));

    gameTokens[playerTokenInfo[_battle.players[0]]].defenseStrength = randDefenceStrength1;
    gameTokens[playerTokenInfo[_battle.players[0]]].attackStrength = MAX_ATTACK_DEFEND_STRENGTH - randDefenceStrength1;


    euint8 rand2=TFHE.shr(TFHE.and(rand,TFHE.asEuint8(56)),3);
    // we take bits from 3to6  of random number to calculate random Defence Strength of Player2
    euint8 randDefenceStrength2=TFHE.and(rand2,TFHE.asEuint8(7));

    gameTokens[playerTokenInfo[_battle.players[1]]].defenseStrength = randDefenceStrength2;
    gameTokens[playerTokenInfo[_battle.players[1]]].attackStrength = MAX_ATTACK_DEFEND_STRENGTH - randDefenceStrength2;  
```




## Function Documentation:

- isPlayer(address addr): Checks if a player is registered.
- getPlayer(address addr): Gets a player's information.
- getAllPlayers(): Gets all players.
- isPlayerToken(address addr): Checks if a player has a battle card.
- getPlayerToken(address addr): Gets a player's battle card information.
- getAllPlayerTokens(): Gets all battle cards.
- isBattle(string memory _name): Checks if a battle exists.
- getBattle(string memory _name): Gets a battle's information.
- getAllBattles(): Gets all battles.
- updateBattle(string memory _name, Battle memory _newBattle): Updates a battle's information.
- registerPlayer(string memory _name, string memory _gameTokenName): Registers a player with a name and creates a battle card.
- createRandomGameToken(string memory _name): Creates a new battle card with random attack and defense strength.
- createBattle(string memory _name): Creates a new battle with a name.
- joinBattle(string memory _name): Joins an existing battle.
- getBattleMoves(string memory _battleName): Gets the attack/defend choices of both players in a battle.
- _registerPlayerMove(uint256 _player, uint8 _choice, string memory _battleName): Registers a player's attack/defend choice.
- attackOrDefendChoice(uint8 _choice, string memory _battleName): Allows a player to choose attack or defend in a battle.
- _awaitBattleResults(string memory _battleName): Triggers the battle resolution process.
- _resolveBattle(Battle memory _battle): Resolves the battle and determines a winner.
- _endBattle(address battleEnder, Battle memory _battle): Ends a battle and updates player information.

- Note: This documentation provides a high-level overview of the smart contract functionality. For detailed implementation details, please refer to the original source code.
