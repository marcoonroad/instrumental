'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract */

const truffleAssert = require('truffle-assertions')
const Clock = artifacts.require('./Clock.sol')

contract('Clock', accounts => {
  it('should fails if sender is not the owner', async () => {
    const clock = await Clock.new({ from: accounts[ 1 ], gasPrice: 0 })

    await truffleAssert.fails(
      clock.tick({ from: accounts[ 2 ], gasPrice: 0 }),
      truffleAssert.ErrorType.REVERT
    )
  })
})
