require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ACCOUNT_1_PRIVATE_KEY, ACCOUNT_2_PRIVATE_KEY } = process.env;


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
      accounts:[`${ACCOUNT_1_PRIVATE_KEY}`,`${ACCOUNT_2_PRIVATE_KEY}`]
    }
  }
};
