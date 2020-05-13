require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      gas: 5000000,
      gasPrice: 5e9,
      networkId: '*',
    },
    kovan: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
      ),
      networkId: 42,
      gasPrice: 1e9,
      gas: 6000000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      ),
      networkId: 42,
      gasPrice: 1e9,
      gas: 6000000,
    },
  },
};
