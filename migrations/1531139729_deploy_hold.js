/* eslint-env node, es6 */
/* global artifacts */

const Hold = artifacts.require('./Hold.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Hold, accounts[ 1 ], 3200)
}
