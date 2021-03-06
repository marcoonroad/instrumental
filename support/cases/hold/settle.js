module.exports = async (params) => {
  const Hold = params.Hold
  const HoldStatus = params.HoldStatus
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const truffleAssert = params.truffleAssert
  const now = params.now
  const timeTravel = params.timeTravel

  const balances = {
    hold: [],
    buyer: [],
    seller: []
  }

  const options = {
    seller: {
      from: accounts[3],
      gasPrice: 0
    },
    buyer: {
      from: accounts[4],
      gasPrice: 0,
      value: 100
    },
    attacker1: {
      from: accounts[9],
      gasPrice: 0,
      value: 100
    },
    attacker2: {
      from: accounts[8],
      gasPrice: 0
    }
  }

  const hold = await Hold.new(accounts[4], 100, options.seller)

  const time = now() + (2 * 24 * 60 * 60)

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.settle(100, options.seller),
    'E_HOLD_NOT_AUTHORIZED'
  )

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.authorize(time, options.attacker1),
    'E_HOLD_ONLY_BUYER'
  )

  await timeTravel(35) // seconds
  await hold.authorize(time, options.buyer)

  balances.buyer.push(await balanceOf(accounts[4]))
  balances.seller.push(await balanceOf(accounts[3]))

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.settle(50, options.attacker2),
    'E_HOLD_ONLY_SELLER'
  )

  await timeTravel(35) // seconds
  // can't redeem without prior settlement
  await truffleAssert.reverts(
    hold.redeem({ from: accounts[4], gasPrice: 0 }),
    'E_HOLD_NOT_SETTLED'
  )

  await timeTravel(35) // seconds
  // can't settle amount greater than authorized one
  await truffleAssert.reverts(
    hold.settle(101, { from: accounts[3], gasPrice: 0 }),
    'E_HOLD_INVALID_SETTLED_AMOUNT'
  )

  await timeTravel(35) // seconds
  // can't settle empty amount, minimal is 1
  await truffleAssert.reverts(
    hold.settle(0, { from: accounts[3], gasPrice: 0 }),
    'E_HOLD_INVALID_SETTLED_AMOUNT'
  )

  await timeTravel(35) // seconds
  // can't refund without expired time
  await truffleAssert.reverts(
    hold.refund({ from: accounts[4], gasPrice: 0 }),
    'E_HOLD_NOT_EXPIRED'
  )

  await timeTravel(35) // seconds
  const txSettle = await hold.settle(100, options.seller)

  truffleAssert.eventEmitted(txSettle, 'LogSettledHold', event => {
    return event.seller === accounts[3] &&
      event.buyer === accounts[4] &&
      event.hold === hold.address
  })

  balances.seller.push(await balanceOf(accounts[3]))
  balances.buyer.push(await balanceOf(accounts[4]))
  balances.hold.push(await balanceOf(hold.address))

  const estimatedAmount = await hold.estimatedAmount()
  const settledAmount = await hold.settledAmount()
  const status = await hold.status()
  const seller = await hold.seller()
  const buyer = await hold.buyer()

  assert.equal(balances.seller[0] + 100, balances.buyer[1])
  assert.equal(seller, accounts[3])
  assert.equal(buyer, accounts[4])
  assert.equal(estimatedAmount, 100)
  assert.equal(settledAmount, 100)
  assert.equal(status.toNumber(), HoldStatus.SETTLED)
  assert.equal(balances.hold[0], 0)
  assert.equal(balances.buyer[0], balances.buyer[1])

  await timeTravel(35) // seconds
  // can't redeem without remaining amount
  await truffleAssert.reverts(
    hold.redeem({ from: accounts[4], gasPrice: 0 }),
    'E_HOLD_NOT_REDEEMABLE'
  )
}
