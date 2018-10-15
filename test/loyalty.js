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
const truffleAssert = require('truffle-assertions')
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
})
