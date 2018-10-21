/* eslint-env node, es6 */
/* global artifacts */

const Migrations = artifacts.require('./helpers/Migrations.sol')

module.exports = async deployer => {
  await deployer.deploy(Migrations)
}
