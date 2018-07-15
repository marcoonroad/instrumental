'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const {
  balanceOf
} = require('../support/account')

const {
  HoldStatus
} = require('../support/hold')

const Hold = artifacts.require('./Hold.sol')

contract('Hold', accounts => {
  it('should settle a hold', async () => {
    const balances = {
      hold: [],
      buyer: [],
      seller: []
    }

    const options = {
      seller: {
        from: accounts[3]
      },
      buyer: {
        from: accounts[4],
        value: 100
      }
    }

    const hold = await Hold.new(accounts[4], 100, options.seller)

    const time = (new Date()).getTime() + (10 * 60 * 60 * 1000)

    await hold.authorize(time, options.buyer)

    balances.buyer.push(await balanceOf(accounts[4]))
    await hold.settle(70, options.seller)

    balances.buyer.push(await balanceOf(accounts[4]))
    balances.hold.push(await balanceOf(hold.address))

    const estimatedAmount = await hold.estimatedAmount()
    const settledAmount = await hold.settledAmount()
    const status = await hold.status()
    const seller = await hold.seller()
    const buyer = await hold.buyer()

    assert.equal(seller, accounts[3])
    assert.equal(buyer, accounts[4])
    assert.equal(estimatedAmount, 100)
    assert.equal(settledAmount, 70)
    assert.equal(status.toNumber(), HoldStatus.SETTLED)
    assert.equal(balances.hold[0], 30)
    assert.equal(balances.buyer[0], balances.buyer[1])
  })
})
