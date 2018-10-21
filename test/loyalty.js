'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const {
  balanceOf, toEther, fromEther
} = require('../support/account')

const {
  timeTravel, now
} = require('../support/block')

const Loyalty = artifacts.require('./Loyalty.sol')
const FallbackMethodCall = artifacts.require('./helpers/FallbackMethodCall.sol')
const truffleAssert = require('../support/assertions')
const cases = require('../support/cases/loyalty')

contract('Loyalty', accounts => {
  const params = {
    accounts,
    Loyalty,
    assert,
    balanceOf,
    timeTravel,
    toEther,
    fromEther,
    truffleAssert,
    now
  }

  it('should create a loyalty contract', async () => {
    await cases.create(params)
  })

  it('should pay a loyalty contract', async () => {
    await cases.transfer(params)
  })

  it('should cashback a loyalty contract', async () => {
    await cases.cashback(params)
  })

  it('should not trigger fallback method', async () => {
    const loyalty = await Loyalty.new(2, 6, { from: accounts[8], gasPrice: 0 })

    const fallbackMethodCall = FallbackMethodCall.at(loyalty.address)

    await timeTravel(35) // seconds
    await truffleAssert.reverts(
      fallbackMethodCall.methodCall(777, { from: accounts[6], value: 200 }),
      'E_LOYALTY_TRIGGERED_FALLBACK_METHOD'
    )
  })
})
