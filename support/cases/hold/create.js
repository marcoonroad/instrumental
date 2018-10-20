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

  balances.seller.push(await balanceOf(accounts[1]))
  balances.buyer.push(await balanceOf(accounts[2]))

  const options = {
    from: accounts[1]
  }
  await truffleAssert.fails(
    Hold.new(accounts[1], 200, options),
    truffleAssert.ErrorType.REVERT
  )
  await truffleAssert.fails(
    Hold.new(accounts[2], 0, options),
    truffleAssert.ErrorType.REVERT
  )

  const nullAddress = '0x' + '0'.repeat(40)
  await truffleAssert.fails(
    Hold.new(nullAddress, 300, options),
    truffleAssert.ErrorType.REVERT
  )
  const hold = await Hold.new(accounts[2], 200, options)

  const txHold = await truffleAssert.createTransactionResult(
    hold, hold.transactionHash
  )

  truffleAssert.eventEmitted(txHold, 'LogPendingHold', event => {
    return event.seller === accounts[1] &&
      event.buyer === accounts[2] &&
      event.hold === hold.address
  })

  balances.seller.push(await balanceOf(accounts[1]))
  balances.buyer.push(await balanceOf(accounts[2]))
  balances.hold.push(await balanceOf(hold.address))

  assert.isAbove(balances.seller[0], balances.seller[1])
  assert.equal(balances.buyer[0], balances.buyer[1])
  assert.equal(balances.hold[0], 0)

  const estimatedAmount = await hold.estimatedAmount()
  const buyer = await hold.buyer()
  const seller = await hold.seller()
  const status = await hold.status()

  balances.seller.push(await balanceOf(accounts[1]))
  balances.buyer.push(await balanceOf(accounts[2]))
  balances.hold.push(await balanceOf(hold.address))

  assert.equal(balances.seller[1], balances.seller[2])
  assert.equal(balances.buyer[1], balances.buyer[2])
  assert.equal(balances.hold[0], balances.hold[1])

  assert.equal(estimatedAmount, 200)
  assert.equal(buyer, accounts[2])
  assert.equal(seller, accounts[1])
  assert.equal(status.toNumber(), HoldStatus.PENDING)

  // can't settle without prior authorization
  await truffleAssert.fails(
    hold.settle(150, { from: accounts[1], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )
  // can't refund without prior authorization
  await truffleAssert.fails(
    hold.refund({ from: accounts[2], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )
}
