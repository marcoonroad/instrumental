module.exports = async (params) => {
  const Hold = params.Hold
  const HoldStatus = params.HoldStatus
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const toEther = params.toEther
  const fromEther = params.fromEther
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
      from: accounts[2]
    },
    buyer: {
      from: accounts[6],
      value: fromEther(2)
    },
    attacker1: {
      from: accounts[9],
      value: fromEther(1)
    },
    attacker2: {
      from: accounts[8]
    }
  }

  const hold = await Hold.new(accounts[6], fromEther(2), options.seller)

  const time = now() + (2 * 24 * 60 * 60)

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.authorize(time, options.attacker1),
    'E_HOLD_INVALID_AUTHORIZED_AMOUNT'
  )

  await timeTravel(35) // seconds
  await hold.authorize(time, options.buyer)

  balances.buyer.push(await balanceOf(accounts[6]))

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.settle(fromEther(0.9), options.attacker2),
    'E_HOLD_ONLY_SELLER'
  )

  await timeTravel(35) // seconds
  await hold.settle(fromEther(1.4), options.seller)

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.redeem(options.attacker2),
    'E_HOLD_ONLY_BUYER'
  )

  await timeTravel(35) // seconds
  const txRedeem = await hold.redeem({ from: accounts[6] })

  truffleAssert.eventEmitted(txRedeem, 'LogRedeemedHold', event => {
    return event.seller === accounts[2] &&
      event.buyer === accounts[6] &&
      event.hold === hold.address
  })

  balances.buyer.push(await balanceOf(accounts[6]))
  balances.hold.push(await balanceOf(hold.address))

  const estimatedAmount = await hold.estimatedAmount()
  const settledAmount = await hold.settledAmount()
  const status = await hold.status()
  const seller = await hold.seller()
  const buyer = await hold.buyer()

  assert.equal(seller, accounts[2])
  assert.equal(buyer, accounts[6])
  assert.equal(toEther(estimatedAmount), 2)
  assert.equal(toEther(settledAmount), 1.4)
  assert.equal(status.toNumber(), HoldStatus.REDEEMED)
  assert.equal(balances.hold[0], 0)
  assert.isBelow(balances.buyer[0], balances.buyer[1])
}
