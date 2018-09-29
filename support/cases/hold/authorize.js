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

  balances.seller.push(await balanceOf(accounts[2]))
  balances.buyer.push(await balanceOf(accounts[3]))

  const options = {
    seller: {
      from: accounts[2]
    },
    buyer: {
      from: accounts[3],
      value: 350
    },
    attacker: {
      from: accounts[9],
      value: 15
    }
  }

  const hold = await Hold.new(accounts[3], 350, options.seller)

  balances.seller.push(await balanceOf(accounts[2]))
  balances.buyer.push(await balanceOf(accounts[3]))
  balances.hold.push(await balanceOf(hold.address))

  assert.isAbove(balances.seller[0], balances.seller[1])
  assert.equal(balances.buyer[0], balances.buyer[1])
  assert.equal(balances.hold[0], 0)

  const time = (new Date()).getTime() + (48 * 60 * 60 * 1000)

  try {
    await hold.authorize(time, options.attacker)
    assert(false)
  } catch (reason) {
    assert(true)
  }
  const txAuthorize = await hold.authorize(time, options.buyer)

  truffleAssert.eventEmitted(txAuthorize, 'LogAuthorizedHold', event => {
    return event.seller === accounts[2] &&
      event.buyer === accounts[3] &&
      event.hold === hold.address
  })

  const status = await hold.status()
  const expiredAt = await hold.expiredAt()
  const buyer = await hold.buyer()
  const seller = await hold.seller()
  const estimatedAmount = await hold.estimatedAmount()

  balances.seller.push(await balanceOf(accounts[2]))
  balances.buyer.push(await balanceOf(accounts[3]))
  balances.hold.push(await balanceOf(hold.address))

  assert.equal(balances.seller[1], balances.seller[2])
  assert.isAbove(balances.buyer[1], balances.buyer[2])
  assert.equal(balances.hold[1], 350)
  assert.equal(status.toNumber(), HoldStatus.AUTHORIZED)
  assert.equal(expiredAt, time)
  assert.equal(estimatedAmount, 350)
  assert.equal(buyer, accounts[3])
  assert.equal(seller, accounts[2])
}
