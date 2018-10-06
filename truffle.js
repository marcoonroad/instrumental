'use strict'

const HDWalletProvider = require('truffle-hdwallet-provider')

const PASS = process.env.INFURA_PASS
const KEY = process.env.INFURA_KEY

module.exports = {
  networks: {
    // default network
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    'ganache-gui': {
      host: 'localhost',
      port: 7545,
      network_id: '*'
    },
    'ropsten-local': {
      host: '127.0.0.1',
      port: 8545,
      network_id: 3,
      gas: 4700000
    },
    'rinkeby-local': {
      host: '127.0.0.1',
      port: 8545,
      network_id: 4
    },
    // parity-only
    'kovan-local': {
      host: '127.0.0.1',
      port: 8545,
      network_id: 42,
      gas: 4700000
    },
    'ropsten-infura': {
      provider: () => new HDWalletProvider(PASS, `https://ropsten.infura.io/${KEY}`),
      network_id: 3,
      gas: 4700000
    }
  }
}
