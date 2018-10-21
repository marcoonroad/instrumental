'use strict'

const HDWalletProvider = require('truffle-hdwallet-provider')

const PASS = process.env.INFURA_PASS
const KEY = process.env.INFURA_KEY

let provider
if (!process.env.SOLIDITY_COVERAGE) {
  provider = () =>
    new HDWalletProvider(PASS, `https://ropsten.infura.io/${KEY}`)
}

module.exports = {
  networks: {
    // default network
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gasPrice: 0
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 6545,
      gas: 0xfffffffffff,
      gasPrice: 0x01
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
      provider,
      network_id: 3,
      gas: 4700000
    }
  },
  mocha: {
    enableTimeouts: false
  }
}
