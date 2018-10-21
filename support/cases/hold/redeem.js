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
      from: accounts[2],
      gasPrice: 0
    },
    buyer: {
      from: accounts[6],
      value: fromEther(2),
      gasPrice: 0
    },
    attacker1: {
      gasPrice: 0,
      from: accounts[9],
      value: fromEther(1)
    },
    attacker2: {
      gasPrice: 0,
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

  // update tracked balances
  balances.buyer.push(await balanceOf(accounts[6]))

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.settle(fromEther(0.9), options.attacker2),
    'E_HOLD_ONLY_SELLER'
  )

  // update tracked balances
  balances.seller.push(await balanceOf(accounts[2]))

  await timeTravel(35) // seconds
  await hold.settle(fromEther(1.4), options.seller)

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    hold.redeem(options.attacker2),
    'E_HOLD_ONLY_BUYER'
  )

  await timeTravel(35) // seconds
  const txRedeem = await hold.redeem({ from: accounts[6], gasPrice: 0 })

  truffleAssert.eventEmitted(txRedeem, 'LogRedeemedHold', event => {
    return event.seller === accounts[2] &&
      event.buyer === accounts[6] &&
      event.hold === hold.address
  })

  // update tracked balances
  balances.buyer.push(await balanceOf(accounts[6]))
  balances.hold.push(await balanceOf(hold.address))
  balances.seller.push(await balanceOf(accounts[2]))

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
  assert.equal(Number(balances.seller[0]) + Number(fromEther(1.4)), balances.seller[1])
  assert.equal(Number(balances.buyer[0]) + Number(fromEther(0.6)), balances.buyer[1])
}
