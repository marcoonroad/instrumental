/* eslint-env node, es6 */
/* global artifacts */

const Loyalty = artifacts.require('./Loyalty.sol')

const DISCOUNT_RATE = 2 // % fee/MDR
const REBATE_BASIS = 6 // months

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Loyalty, DISCOUNT_RATE, REBATE_BASIS)
}
