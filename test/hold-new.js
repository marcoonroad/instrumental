'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const {
  HoldStatus
} = require('../support/hold')

const {
  balanceOf
} = require('../support/account')

const Hold = artifacts.require('./Hold.sol')

contract('Hold', accounts => {
  it('should create a hold', async () => {
    const balances = {
      hold: [],
      buyer: [],
      seller: []
    }

    balances.seller.push(await balanceOf(accounts[1]))
    balances.buyer.push(await balanceOf(accounts[2]))

    const options = {
      from: accounts[1]
    }

    const hold = await Hold.new(accounts[2], 200, options)

    balances.seller.push(await balanceOf(accounts[1]))
    balances.buyer.push(await balanceOf(accounts[2]))
    balances.hold.push(await balanceOf(hold.address))

    assert.isAbove(balances.seller[0], balances.seller[1])
    assert.equal(balances.buyer[0], balances.buyer[1])
    assert.equal(balances.hold[0], 0)

    const estimatedAmount = await hold.estimatedAmount()
    const buyer = await hold.buyer()
    const seller = await hold.seller()
    const status = await hold.status()

    balances.seller.push(await balanceOf(accounts[1]))
    balances.buyer.push(await balanceOf(accounts[2]))
    balances.hold.push(await balanceOf(hold.address))

    assert.equal(balances.seller[1], balances.seller[2])
    assert.equal(balances.buyer[1], balances.buyer[2])
    assert.equal(balances.hold[0], balances.hold[1])

    assert.equal(estimatedAmount, 200)
    assert.equal(buyer, accounts[2])
    assert.equal(seller, accounts[1])
    assert.equal(status.toNumber(), HoldStatus.PENDING)
  })
})
