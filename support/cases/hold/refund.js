module.exports = async (params) => {
  const Hold = params.Hold
  const HoldStatus = params.HoldStatus
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const toEther = params.toEther
  const fromEther = params.fromEther
  const truffleAssert = params.truffleAssert
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

  const time = Math.floor((new Date()).getTime() / 1000) + (48 * 60 * 60)

  await truffleAssert.fails(
    hold.authorize(time, options.attacker1),
    truffleAssert.ErrorType.REVERT
  )
  await hold.authorize(time, options.buyer)

  balances.buyer.push(await balanceOf(accounts[6]))

  await truffleAssert.fails(
    hold.settle(fromEther(0.9), options.attacker2),
    truffleAssert.ErrorType.REVERT
  )

  const skipTime = Math.floor((new Date()).getTime() / 1000) + (72 * 60 * 60)
  await timeTravel(skipTime)

  await truffleAssert.fails(
    hold.settle(fromEther(1.4), options.seller),
    truffleAssert.ErrorType.REVERT
  )

  await truffleAssert.fails(
    hold.refund(options.attacker2),
    truffleAssert.ErrorType.REVERT
  )
  const txRefund = await hold.refund({ from: accounts[6] })

  truffleAssert.eventEmitted(txRefund, 'LogRefundedHold', event => {
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
  assert.equal(toEther(settledAmount), 0)
  assert.equal(status.toNumber(), HoldStatus.REFUNDED)
  assert.equal(balances.hold[0], 0)
  assert.isBelow(balances.buyer[0], balances.buyer[1])
}
