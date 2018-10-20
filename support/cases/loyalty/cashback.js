module.exports = async (params) => {
  const Loyalty = params.Loyalty
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const toEther = params.toEther
  const fromEther = params.fromEther
  const truffleAssert = params.truffleAssert
  const timeTravel = params.timeTravel
  const now = params.now

  const _discountRate = 1
  const _rebateBasis = 12

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, {
    from: accounts[7],
    gasPrice: 0
  })

  const oldCustomerBalance = toEther(await balanceOf(accounts[4]))
  const oldMerchantBalance = toEther(await balanceOf(accounts[7]))

  await timeTravel(35) // seconds
  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(3),
    gasPrice: 0
  })

  await timeTravel(35) // seconds
  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(1),
    gasPrice: 0
  })

  await truffleAssert.fails(
    loyalty.receive({ from: accounts[2], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )
  await loyalty.receive({ from: accounts[7], gasPrice: 0 })

  await timeTravel(35) // seconds
  // bugfix test part:
  // first claimed cashback doesn't respect
  // rebate basis interval, so immediate
  // cashbacks are possible on the first time
  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )

  // forwards time by 12 months
  await timeTravel(12 * 30 * 24 * 60 * 60)

  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[5], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )

  const oldLoyaltyBalance = toEther(await balanceOf(loyalty.address))

  const timestamp = now()
  const txCashback = await loyalty.cashback({ from: accounts[4], gasPrice: 0 })

  const newCustomerBalance = toEther(await balanceOf(accounts[4]))
  const newMerchantBalance = toEther(await balanceOf(accounts[7]))
  const newLoyaltyBalance = toEther(await balanceOf(loyalty.address))

  const totalAmount = 4
  const discountedAmount = totalAmount * 0.01
  const merchantAmount = totalAmount - discountedAmount

  truffleAssert.eventEmitted(txCashback, 'LogLoyaltyCashback', event => {
    return (
      event.customer.toString() === accounts[4].toString() &&
      event.reward.toString() === fromEther(discountedAmount.toString()) &&
      Number(event.timestamp) >= timestamp
    )
  })

  assert.equal(
    Number(newMerchantBalance),
    Number(oldMerchantBalance) + Number(merchantAmount)
  )
  assert.equal(
    Number(newCustomerBalance),
    Number(oldCustomerBalance) - Number(merchantAmount)
  )
  assert.equal(
    Number(newLoyaltyBalance),
    Number(oldLoyaltyBalance) - Number(discountedAmount)
  )

  await timeTravel(35) // seconds
  // empty customer cashback balance
  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )

  await timeTravel(35) // seconds
  // can't cashback from merchant account
  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[7], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )

  await timeTravel(35) // seconds
  // bugfix test part:
  // rebate basis interval must reset after claimed cashback
  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(5),
    gasPrice: 0
  })

  // forwards time by 1 month
  await timeTravel(30 * 24 * 60 * 60)

  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    truffleAssert.ErrorType.REVERT
  )
}
