'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract */

const Clock = artifacts.require('./Clock.sol')
const truffleAssert = require('../support/assertions')

contract('Clock', accounts => {
  it('should fails if sender is not the owner', async () => {
    const clock = await Clock.new({ from: accounts[ 1 ], gasPrice: 0 })

    await truffleAssert.reverts(
      clock.tick({ from: accounts[ 2 ], gasPrice: 0 }),
      'E_CLOCK_ONLY_OWNER'
    )
  })

  it('should fails on 30-seconds time-drift dependence', async () => {
    const clock = await Clock.new({ from: accounts[ 3 ], gasPrice: 0 })

    await truffleAssert.reverts(
      clock.tick({ from: accounts[ 3 ], gasPrice: 0 }),
      'E_CLOCK_TIME_DRIFT'
    )
  })
})
