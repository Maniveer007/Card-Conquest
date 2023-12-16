require("@nomicfoundation/hardhat-toolbox");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'local',
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  
  networks:{
    local:{
      chainId:9000,
      url:'http://localhost:8545',
    }
  }
};
