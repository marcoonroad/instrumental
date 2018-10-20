module.exports = async (params) => {
  const Loyalty = params.Loyalty
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const fromEther = params.fromEther
  const toEther = params.toEther
  const truffleAssert = params.truffleAssert
  const now = params.now
  const timeTravel = params.timeTravel

  const options = {
    from: accounts[3],
    gasPrice: 0
  }

  const _discountRate = 5
  const _rebateBasis = 1

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, options)

  const timestamp = now()
  const oldMerchantBalance = toEther(await balanceOf(accounts[3]))
  const oldCustomerBalance = toEther(await balanceOf(accounts[5]))
  const oldLoyaltyBalance = toEther(await balanceOf(loyalty.address))
  const amount = fromEther(2)

  const transferOptions = {
    from: accounts[5],
    value: amount,
    gasPrice: 0
  }

  await timeTravel(35) // seconds
  await truffleAssert.fails(
    loyalty.sendTransaction({
      from: accounts[5],
      value: 95,
      gasPrice: 0
    }),
    truffleAssert.ErrorType.REVERT
  )

  // can't pull when merchant balance is 0
  await truffleAssert.fails(
    loyalty.receive({ from: accounts[3], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )

  await timeTravel(35) // seconds
  const txTransfer = await loyalty.sendTransaction(transferOptions)

  truffleAssert.eventEmitted(txTransfer, 'LogLoyaltyPayment', event => {
    return (
      event.customer.toString() === accounts[5].toString() &&
      event.amount.toString() === fromEther('2') &&
      Number(event.timestamp) >= timestamp
    )
  })

  // for the merchant to receive his own money, it
  // doesn't depend on time, it's only depend on balance
  await truffleAssert.fails(
    loyalty.receive({ from: accounts[4], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )
  await loyalty.receive({ from: accounts[3], gasPrice: 0 })

  const newMerchantBalance = toEther(await balanceOf(accounts[3]))
  const newCustomerBalance = toEther(await balanceOf(accounts[5]))
  const newLoyaltyBalance = toEther(await balanceOf(loyalty.address))

  assert.isAbove(Number(newMerchantBalance), Number(oldMerchantBalance))
  assert.isBelow(Number(newCustomerBalance), Number(oldCustomerBalance))
  assert.isAbove(Number(newLoyaltyBalance), Number(oldLoyaltyBalance))

  const paidAmount = 2
  const discountedAmount = 2 * 0.05
  const merchantAmount = paidAmount - discountedAmount

  assert.equal(
    Number(newMerchantBalance),
    Number(oldMerchantBalance) + Number(merchantAmount)
  )
  assert.equal(
    Number(newLoyaltyBalance),
    Number(oldLoyaltyBalance) + Number(discountedAmount)
  )

  await timeTravel(35) // seconds
  // merchant himself can't enter loyalty program
  await truffleAssert.fails(
    loyalty.sendTransaction({
      from: accounts[3],
      value: fromEther(1.2),
      gasPrice: 0
    }),
    truffleAssert.ErrorType.REVERT
  )
}
