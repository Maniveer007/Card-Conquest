// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
import "fhevm/lib/TFHE.sol";



contract Card_Conquest  {


  euint8 public  MAX_ATTACK_DEFEND_STRENGTH = TFHE.asEuint8(10);

  enum BattleStatus{ PENDING, STARTED, ENDED }

  /// @dev GameTok struct to store player token info
  struct GameToken {
    string name; /// @param name battle card name; set by player
    uint256 id; /// @param id battle card token id; will be randomly generated
    euint8 attackStrength; /// @param attackStrength battle card attack; generated randomly
    euint8 defenseStrength; /// @param defenseStrength battle card defense; generated randomly
  }

  struct returnGameToken{
    string name;
    uint256 id;
    bytes attackStrength;
    bytes defenseStrength;
  }

  /// @dev Player struct to store player info
  struct Player {
    address playerAddress; /// @param playerAddress player wallet address
    string playerName; /// @param playerName player name; set by player during registration
    euint8 playerMana; /// @param playerMana player mana; affected by battle results
    euint8 playerHealth; /// @param playerHealth player health; affected by battle results
    bool inBattle; /// @param inBattle boolean to indicate if a player is in battle
  }
  struct ReturnPlayer {
    address playerAddress; /// @param playerAddress player wallet address
    string playerName; /// @param playerName player name; set by player during registration
    bytes playerMana; /// @param playerMana player mana; affected by battle results
    bytes playerHealth; /// @param playerHealth player health; affected by battle results
    bool inBattle; /// @param inBattle boolean to indicate if a player is in battle
  }

  /// @dev Battle struct to store battle info
  struct Battle {
    BattleStatus battleStatus; /// @param battleStatus enum to indicate battle status
    bytes32 battleHash; /// @param battleHash a hash of the battle name
    string name; /// @param name battle name; set by player who creates battle
    address[2] players; /// @param players address array representing players in this battle
    uint8[2] moves; /// @param moves uint array representing players' move
    address winner; /// @param winner winner address
  }

  mapping(address => uint256) public playerInfo; // Mapping of player addresses to player index in the players array
  mapping(address => uint256) public playerTokenInfo; // Mapping of player addresses to player token index in the gameTokens array
  mapping(string => uint256) public battleInfo; // Mapping of battle name to battle index in the battles array

  Player[] public players; // Array of players
  GameToken[] public gameTokens; // Array of game tokens
  Battle[] public battles; // Array of battles

  function isPlayer(address addr) public view returns (bool) {
    if(playerInfo[addr] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getPlayer(address addr) public view returns (Player memory) {
    require(isPlayer(addr), "Player doesn't exist!");
    return players[playerInfo[addr]];
  }

  function getPlayerOut(address addr,bytes32 pk) public view returns (ReturnPlayer memory) {
    require(isPlayer(addr), "Player doesn't exist!");
    return  ReturnPlayer(players[playerInfo[addr]].playerAddress,players[playerInfo[addr]].playerName,TFHE.reencrypt(players[playerInfo[addr]].playerMana,pk),TFHE.reencrypt(players[playerInfo[addr]].playerHealth,pk),players[playerInfo[addr]].inBattle);
  }

  function getAllPlayers() public view returns (Player[] memory) {
    return players;
  }

  function isPlayerToken(address addr) public view returns (bool) {
    if(playerTokenInfo[addr] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getPlayerToken(address addr) public view returns (GameToken memory) {
    require(isPlayerToken(addr), "Game token doesn't exist!");
    return gameTokens[playerTokenInfo[addr]];
  }
  function getPlayerTokenOut(address addr , bytes32 pk) public view returns (returnGameToken memory) {
    require(isPlayerToken(addr), "Game token doesn't exist!");
    return returnGameToken(
    gameTokens[playerTokenInfo[addr]].name,gameTokens[playerTokenInfo[addr]].id,TFHE.reencrypt(gameTokens[playerTokenInfo[addr]].attackStrength,pk),TFHE.reencrypt(gameTokens[playerTokenInfo[addr]].defenseStrength,pk)
    );
  }

  function getAllPlayerTokens() public view returns (GameToken[] memory) {
    return gameTokens;
  }

  // Battle getter function
  function isBattle(string memory _name) public view returns (bool) {
    if(battleInfo[_name] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getBattle(string memory _name) public view returns (Battle memory) {
    require(isBattle(_name), "Battle doesn't exist!");
    return battles[battleInfo[_name]];
  }
  

  function getAllBattles() public view returns (Battle[] memory) {
    return battles;
  }

  function updateBattle(string memory _name, Battle memory _newBattle) private {
    require(isBattle(_name), "Battle doesn't exist");
    battles[battleInfo[_name]] = _newBattle;
  }

  // Events
  event NewPlayer(address indexed owner, string name);
  event NewBattle(string battleName, address indexed player1, address indexed player2);
  event BattleEnded(string battleName, address indexed winner, address indexed loser);
  event BattleMove(string indexed battleName, bool indexed isFirstMove);
  event NewGameToken(address indexed owner, uint256 id, euint8 attackStrength, euint8 defenseStrength);
  event RoundEnded(address[2] damagedPlayers);

 
  
  constructor()  { 
    initialize();
  }

  

  function initialize() private {
    gameTokens.push(GameToken("", 0, TFHE.asEuint8(0), TFHE.asEuint8(0)));
    players.push(Player(address(0), "", TFHE.asEuint8(0), TFHE.asEuint8(0), false));
    battles.push(Battle(BattleStatus.PENDING, bytes32(0), "", [address(0), address(0)], [0, 0], address(0)));
  }

  /// @dev Registers a player
  /// @param _name player name; set by player
  function registerPlayer(string memory _name, string memory _gameTokenName) external {
    require(!isPlayer(msg.sender), "Player already registered"); // Require that player is not already registered
    
    uint256 _id = players.length;
    players.push(Player(msg.sender, _name, TFHE.asEuint8(10), TFHE.asEuint8(25), false)); // Adds player to players array
    playerInfo[msg.sender] = _id; // Creates player info mapping

    createRandomGameToken(_gameTokenName);
    
    emit NewPlayer(msg.sender, _name); // Emits NewPlayer event
  }

  
  


  /// @dev internal function to create a new Battle Card
  function _createGameToken(string memory _name) internal returns(GameToken memory)  {
    euint8 rand=TFHE.randEuint8();
    euint8 randDefenseStrength=TFHE.and(rand,TFHE.asEuint8(7));
    euint8 randAttackStrength = MAX_ATTACK_DEFEND_STRENGTH - randDefenseStrength;
    
       uint8 randId = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100);
    randId = randId % 6;
    if (randId == 0) {
      randId++;
    }
    
    GameToken memory newGameToken = GameToken(
      _name,
      randId,
      randAttackStrength,
      randDefenseStrength
    );

    uint256 _id = gameTokens.length;
    gameTokens.push(newGameToken);
    playerTokenInfo[msg.sender] = _id;


    
    emit NewGameToken(msg.sender, randId, randAttackStrength, randDefenseStrength);
    return newGameToken;
  }

  /// @dev Creates a new game token
  /// @param _name game token name; set by player
  function createRandomGameToken(string memory _name) public {
    require(!getPlayer(msg.sender).inBattle, "Player is in a battle"); // Require that player is not already in a battle
    require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
    
    _createGameToken(_name); // Creates game token
  }



  /// @dev Creates a new battle
  /// @param _name battle name; set by player
  function createBattle(string memory _name) external returns (Battle memory) {
    require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
    require(!isBattle(_name), "Battle already exists!"); // Require battle with same name should not exist

    bytes32 battleHash = keccak256(abi.encode(_name));
    
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
    
    return _battle;
  }

  /// @dev Player joins battle
  /// @param _name battle name; name of battle player wants to join
  function joinBattle(string memory _name) external returns (Battle memory) {
    Battle memory _battle = getBattle(_name);

    require(_battle.battleStatus == BattleStatus.PENDING, "Battle already started!"); // Require that battle has not started
    require(_battle.players[0] != msg.sender, "Only player two can join a battle"); // Require that player 2 is joining the battle
    require(!getPlayer(msg.sender).inBattle, "Already in battle"); // Require that player is not already in a battle
    
    _battle.battleStatus = BattleStatus.STARTED;
    _battle.players[1] = msg.sender;
    updateBattle(_name, _battle);

    players[playerInfo[_battle.players[0]]].inBattle = true;
    players[playerInfo[_battle.players[1]]].inBattle = true;

    emit NewBattle(_battle.name, _battle.players[0], msg.sender); // Emits NewBattle event
    return _battle;
  }

  // Read battle move info for player 1 and player 2
  function getBattleMoves(string memory _battleName) public view returns (uint256 P1Move, uint256 P2Move) {
    Battle memory _battle = getBattle(_battleName);

    P1Move = _battle.moves[0];
    P2Move = _battle.moves[1];

    return (P1Move, P2Move);
  }

  function _registerPlayerMove(uint256 _player, uint8 _choice, string memory _battleName) internal {
    require(_choice == 1 || _choice == 2, "Choice should be either 1 or 2!");
    if(_choice == 1){
    TFHE.optReq(TFHE.ge(getPlayer(msg.sender).playerMana,3));
    }
    battles[battleInfo[_battleName]].moves[_player] = _choice;
  }

  // User chooses attack or defense move for battle card
  function attackOrDefendChoice(uint8 _choice, string memory _battleName) external {
    Battle memory _battle = getBattle(_battleName);

    require(
        _battle.battleStatus == BattleStatus.STARTED,
        "Battle not started. Please tell another player to join the battle"
    ); // Require that battle has started
    require(
        _battle.battleStatus != BattleStatus.ENDED,
        "Battle has already ended"
    ); // Require that battle has not ended
    
    require(
      msg.sender == _battle.players[0] || msg.sender == _battle.players[1],
      "You are not in this battle"
    ); // Require that player is in the battle

    require(_battle.moves[_battle.players[0] == msg.sender ? 0 : 1] == 0, "You have already made a move!");

    _registerPlayerMove(_battle.players[0] == msg.sender ? 0 : 1, _choice, _battleName);

    _battle = getBattle(_battleName);
    uint _movesLeft = 2 - (_battle.moves[0] == 0 ? 0 : 1) - (_battle.moves[1] == 0 ? 0 : 1);
    emit BattleMove(_battleName, _movesLeft == 1 ? true : false);
    
    if(_movesLeft == 0) {
      _awaitBattleResults(_battleName);
    }
  }

  // Awaits battle results
  function _awaitBattleResults(string memory _battleName) internal {
    Battle memory _battle = getBattle(_battleName);

    require(
      msg.sender == _battle.players[0] || msg.sender == _battle.players[1],
      "Only players in this battle can make a move"
    );

    require(
      _battle.moves[0] != 0 &&  _battle.moves[1] != 0,
      "Players still need to make a move"
    );

    _resolveBattle(_battle);
  }

  struct P {
    uint index;
    uint move;
    euint8 health;
    euint8 attack;
    euint8 defense;
  }

  /// @dev Resolve battle function to determine winner and loser of battle
  /// @param _battle battle; battle to resolve

  function _resolveBattle(Battle memory _battle) internal {
    P memory p1 = P(
        playerInfo[_battle.players[0]],
        _battle.moves[0],
        getPlayer(_battle.players[0]).playerHealth,
        getPlayerToken(_battle.players[0]).attackStrength,
        getPlayerToken(_battle.players[0]).defenseStrength
    );

    P memory p2 = P(
        playerInfo[_battle.players[1]],
        _battle.moves[1],
        getPlayer(_battle.players[1]).playerHealth,
        getPlayerToken(_battle.players[1]).attackStrength,
        getPlayerToken(_battle.players[1]).defenseStrength
    );

    address[2] memory _damagedPlayers = [address(0) , address(0)];
    euint8 TFHEwinner=TFHE.asEuint8(0);
    ebool isplayer1winner=TFHE.asEbool(false);
    ebool isplayer2winner=TFHE.asEbool(false);
    
    if (p1.move == 1 && p2.move == 1) {
      
      isplayer1winner=TFHE.ge(p1.attack , p2.health);
      TFHEwinner=TFHE.cmux(isplayer1winner,TFHE.asEuint8(1),TFHEwinner);
      isplayer2winner=TFHE.ge(p2.attack , p1.health);
      TFHEwinner=TFHE.cmux(isplayer2winner,TFHE.asEuint8(2),TFHEwinner);

      ebool nowinner=TFHE.eq(TFHEwinner,0);

        players[p1.index].playerHealth =TFHE.cmux(nowinner,players[p1.index].playerHealth- p2.attack,players[p1.index].playerHealth);
        players[p2.index].playerHealth =TFHE.cmux(nowinner,players[p2.index].playerHealth-p1.attack,players[p2.index].playerHealth);
       

        players[p1.index].playerMana =TFHE.cmux(nowinner,TFHE.sub(players[p1.index].playerMana,3),players[p1.index].playerMana);
        players[p2.index].playerMana =TFHE.cmux(nowinner,TFHE.sub(players[p2.index].playerMana,3),players[p2.index].playerMana);
        

        // Both player's health damaged
        _damagedPlayers = _battle.players;
      // }
   
    } else if (p1.move == 1 && p2.move == 2) {
      euint8 PHAD = p2.health + p2.defense;
      isplayer1winner=TFHE.ge(p1.attack , PHAD);
      TFHEwinner=TFHE.cmux(isplayer1winner,TFHE.asEuint8(1),TFHEwinner);

        euint8 healthAfterAttack;
        
          healthAfterAttack = TFHE.cmux(TFHE.gt(p2.defense , p1.attack),p2.health,PHAD - p1.attack);


          // Player 2 health damaged
          _damagedPlayers[0] = _battle.players[1];
        

        players[p2.index].playerHealth = healthAfterAttack;

        players[p1.index].playerMana =TFHE.sub(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.add(players[p2.index].playerMana,3) ;
       
      }
    
     else if (p1.move == 2 && p2.move == 1) {

      euint8 PHAD = p1.health + p1.defense;
      isplayer2winner=TFHE.ge(p2.attack , PHAD);
      TFHEwinner=TFHE.cmux(isplayer2winner,TFHE.asEuint8(2),TFHEwinner);

        euint8 healthAfterAttack;
        
         healthAfterAttack = TFHE.cmux(TFHE.gt(p1.defense , p2.attack),p1.health,PHAD - p2.attack);

          // Player 1 health damaged
          _damagedPlayers[0] = _battle.players[0];
        

        players[p1.index].playerHealth = healthAfterAttack;

        players[p1.index].playerMana =TFHE.add(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.sub(players[p2.index].playerMana,3) ;

      
    } else if (p1.move == 2 && p2.move == 2) {
        players[p1.index].playerMana =TFHE.add(players[p1.index].playerMana,3) ;
        players[p2.index].playerMana = TFHE.add(players[p2.index].playerMana,3) ;
    }

    uint8 winner=TFHE.decrypt(TFHEwinner);
    if(winner==1){
      _endBattle(_battle.players[0], _battle);
    }
    else if(winner==2){
      _endBattle(_battle.players[1], _battle);
    }
    


    emit RoundEnded(
      _damagedPlayers
    );

    // Reset moves to 0
    _battle.moves[0] = 0;
    _battle.moves[1] = 0;
    updateBattle(_battle.name, _battle);

    // Reset random attack and defense strength

    euint8 rand=TFHE.randEuint8();
    euint8 randDefenceStrength1=TFHE.and(rand,TFHE.asEuint8(7));

    gameTokens[playerTokenInfo[_battle.players[0]]].defenseStrength = randDefenceStrength1;
    gameTokens[playerTokenInfo[_battle.players[0]]].attackStrength = MAX_ATTACK_DEFEND_STRENGTH - randDefenceStrength1;


    euint8 rand2=TFHE.shr(TFHE.and(rand,TFHE.asEuint8(56)),3);
    euint8 randDefenceStrength2=TFHE.and(rand2,TFHE.asEuint8(7));

    gameTokens[playerTokenInfo[_battle.players[1]]].defenseStrength = randDefenceStrength2;
    gameTokens[playerTokenInfo[_battle.players[1]]].attackStrength = MAX_ATTACK_DEFEND_STRENGTH - randDefenceStrength2;   
  }

  function quitBattle(string memory _battleName) public {
    Battle memory _battle = getBattle(_battleName);
    require(_battle.players[0] == msg.sender || _battle.players[1] == msg.sender, "You are not in this battle!");

    _battle.players[0] == msg.sender ? _endBattle(_battle.players[1], _battle) : _endBattle(_battle.players[0], _battle);
  }

  /// @dev internal function to end the battle
  /// @param battleEnder winner address
  /// @param _battle battle; taken from attackOrDefend function
  function _endBattle(address battleEnder, Battle memory _battle) internal returns (Battle memory) {
    require(_battle.battleStatus != BattleStatus.ENDED, "Battle already ended"); // Require that battle has not ended

    _battle.battleStatus = BattleStatus.ENDED;
    _battle.winner = battleEnder;
    updateBattle(_battle.name, _battle);

    uint p1 = playerInfo[_battle.players[0]];
    uint p2 = playerInfo[_battle.players[1]];

    players[p1].inBattle = false;
    players[p1].playerHealth = TFHE.asEuint8(25);
    players[p1].playerMana = TFHE.asEuint8(10);

    players[p2].inBattle = false;
    players[p2].playerHealth = TFHE.asEuint8(25);
    players[p2].playerMana = TFHE.asEuint8(10);

    address _battleLoser = battleEnder == _battle.players[0] ? _battle.players[1] : _battle.players[0];

    emit BattleEnded(_battle.name, battleEnder, _battleLoser); // Emits BattleEnded event

    return _battle;
  }


}

// Developed By MAVI
