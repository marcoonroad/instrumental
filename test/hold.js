/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const Hold = artifacts.require('./Hold.sol')

contract('Hold', function (accounts) {
  it('should test deployed instance', async () => {
    const instance = await Hold.deployed()

    const estimatedAmount = await instance.estimatedAmount()
    const buyer = await instance.buyer()
    const seller = await instance.seller()

    assert.equal(estimatedAmount, 3200)
    assert.equal(buyer, accounts[1])
    assert.equal(seller, accounts[0])
  })
})
