'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const {
  HoldStatus
} = require('../support/hold')

const {
  balanceOf, toEther, fromEther
} = require('../support/account')

const {
  timeTravel
} = require('../support/block')

const Hold = artifacts.require('./Hold.sol')
const truffleAssert = require('truffle-assertions')
const cases = require('../support/cases/hold')

contract('Hold', accounts => {
  const params = {
    accounts,
    Hold,
    HoldStatus,
    assert,
    balanceOf,
    timeTravel,
    toEther,
    fromEther,
    truffleAssert
  }

  it('should create a hold', async () => {
    await cases.create(params)
  })

  it('should authorize a hold', async () => {
    await cases.authorize(params)
  })

  it('should settle a hold', async () => {
    await cases.settle(params)
  })

  it('should redeem a hold whenever it can', async () => {
    await cases.redeem(params)
  })

  it('should refund buyer if hold expires', async () => {
    await cases.refund(params)
  })
})
