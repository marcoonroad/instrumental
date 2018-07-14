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
  it('should authorize a hold', async () => {
    const balances = {
      hold: [],
      buyer: [],
      seller: []
    }

    balances.seller.push(await balanceOf(accounts[2]))
    balances.buyer.push(await balanceOf(accounts[3]))

    const options = {
      seller: {
        from: accounts[2]
      },
      buyer: {
        from: accounts[3],
        value: 350
      }
    }

    const hold = await Hold.new(accounts[3], 350, options.seller)

    balances.seller.push(await balanceOf(accounts[2]))
    balances.buyer.push(await balanceOf(accounts[3]))
    balances.hold.push(await balanceOf(hold.address))

    assert.isAbove(balances.seller[0], balances.seller[1])
    assert.equal(balances.buyer[0], balances.buyer[1])
    assert.equal(balances.hold[0], 0)

    const time = (new Date()).getTime() + (10 * 60 * 60 * 1000)

    await hold.authorize(time, options.buyer)

    const status = await hold.status()
    const expiredAt = await hold.expiredAt()
    const buyer = await hold.buyer()
    const seller = await hold.seller()
    const estimatedAmount = await hold.estimatedAmount()

    balances.seller.push(await balanceOf(accounts[2]))
    balances.buyer.push(await balanceOf(accounts[3]))
    balances.hold.push(await balanceOf(hold.address))

    assert.equal(balances.seller[1], balances.seller[2])
    assert.isAbove(balances.buyer[1], balances.buyer[2])
    assert.equal(balances.hold[1], 350)
    assert.equal(status.toNumber(), HoldStatus.AUTHORIZED)
    assert.equal(expiredAt, time)
    assert.equal(estimatedAmount, 350)
    assert.equal(buyer, accounts[3])
    assert.equal(seller, accounts[2])
  })
})
