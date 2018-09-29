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

const cases = require('../support/cases/hold')

contract('Hold', accounts => {
  const params = {
    accounts, Hold, HoldStatus, assert, balanceOf
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
})
