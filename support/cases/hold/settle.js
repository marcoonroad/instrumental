module.exports = async (params) => {
  const Hold = params.Hold
  const HoldStatus = params.HoldStatus
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const truffleAssert = params.truffleAssert

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

  const time = (new Date()).getTime() + (48 * 60 * 60 * 1000)

  try {
    await hold.authorize(time, options.attacker1)
    assert(false)
  } catch (reason) {
    assert(true)
  }
  await hold.authorize(time, options.buyer)

  balances.buyer.push(await balanceOf(accounts[4]))

  try {
    await hold.settle(50, options.attacker2)
    assert(false)
  } catch (reason) {
    assert(true)
  }
  const txSettle = await hold.settle(70, options.seller)

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
  assert.equal(settledAmount, 70)
  assert.equal(status.toNumber(), HoldStatus.SETTLED)
  assert.equal(balances.hold[0], 30)
  assert.equal(balances.buyer[0], balances.buyer[1])
}
