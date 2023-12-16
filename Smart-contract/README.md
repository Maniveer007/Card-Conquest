
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