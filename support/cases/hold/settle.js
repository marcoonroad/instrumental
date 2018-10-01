module.exports = async (params) => {
  const Hold = params.Hold
  const HoldStatus = params.HoldStatus
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const truffleAssert = params.truffleAssert
  const now = params.now

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
    },
    attacker1: {
      from: accounts[9],
      value: 20
    },
    attacker2: {
      from: accounts[8]
    }
  }

  const hold = await Hold.new(accounts[4], 100, options.seller)

  const time = now() + (2 * 24 * 60 * 60)

  await truffleAssert.fails(
    hold.authorize(time, options.attacker1),
    truffleAssert.ErrorType.REVERT
  )
  await hold.authorize(time, options.buyer)

  balances.buyer.push(await balanceOf(accounts[4]))

  await truffleAssert.fails(
    hold.settle(50, options.attacker2),
    truffleAssert.ErrorType.REVERT
  )
  const txSettle = await hold.settle(100, options.seller)

  truffleAssert.eventEmitted(txSettle, 'LogSettledHold', event => {
    return event.seller === accounts[3] &&
      event.buyer === accounts[4] &&
      event.hold === hold.address
  })

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
  assert.equal(settledAmount, 100)
  assert.equal(status.toNumber(), HoldStatus.SETTLED)
  assert.equal(balances.hold[0], 0)
  assert.equal(balances.buyer[0], balances.buyer[1])

  await truffleAssert.fails(
    hold.redeem({ from: accounts[4] }),
    truffleAssert.ErrorType.REVERT
  )
}
