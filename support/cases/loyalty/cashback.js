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
  const _acceptanceFee = fromEther(0.0002)

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, _acceptanceFee, {
    from: accounts[7],
    gasPrice: 0
  })

  const oldCustomerBalance = toEther(await balanceOf(accounts[4]))
  const oldMerchantBalance = toEther(await balanceOf(accounts[7]))

  await loyalty.enter({
    from: accounts[4],
    value: _acceptanceFee,
    gasPrice: 0
  })

  await loyalty.enter({
    from: accounts[1],
    value: _acceptanceFee,
    gasPrice: 0
  })

  await timeTravel(35) // seconds
  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(3),
    gasPrice: 0
  })
  await loyalty.sendTransaction({
    from: accounts[1],
    value: fromEther(3),
    gasPrice: 0
  })

  await timeTravel(35) // seconds
  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(1),
    gasPrice: 0
  })
  await loyalty.sendTransaction({
    from: accounts[1],
    value: fromEther(5),
    gasPrice: 0
  })

  await truffleAssert.reverts(
    loyalty.receive({ from: accounts[2], gasPrice: 0 }),
    'E_LOYALTY_ONLY_MERCHANT'
  )
  await loyalty.receive({ from: accounts[7], gasPrice: 0 })

  await timeTravel(35) // seconds
  // bugfix test part:
  // first claimed cashback doesn't respect
  // rebate basis interval, so immediate
  // cashbacks are possible on the first time
  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    'E_LOYALTY_CASHBACK_NOT_READY'
  )

  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[5], gasPrice: 0 }),
    'E_LOYALTY_NON_MEMBER'
  )
  await loyalty.enter({
    value: _acceptanceFee,
    from: accounts[5],
    gasPrice: 0
  })

  // forwards time by 13 months
  await timeTravel(13 * 30 * 24 * 60 * 60)

  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[5], gasPrice: 0 }),
    'E_LOYALTY_EMPTY_CUSTOMER_BALANCE'
  )

  const oldLoyaltyBalance = toEther(await balanceOf(loyalty.address))

  await loyalty.cashback({ from: accounts[1], gasPrice: 0 })

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
    Number(oldMerchantBalance) + Number(merchantAmount) + (8 - 0.08)
  )
  assert.equal(
    Number(newCustomerBalance) + Number(toEther(_acceptanceFee)),
    Number(oldCustomerBalance) - Number(merchantAmount)
  )
  assert.equal(
    Number.parseInt((Number(newLoyaltyBalance) + Number(discountedAmount) + 0.08) * 10e4),
    Number.parseInt(Number(oldLoyaltyBalance) * 10e4)
  )

  await timeTravel(35) // seconds
  // empty customer cashback balance
  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    'E_LOYALTY_EMPTY_CUSTOMER_BALANCE'
  )

  await timeTravel(35) // seconds
  // can't cashback from merchant account
  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[7], gasPrice: 0 }),
    'E_LOYALTY_EXCEPT_MERCHANT'
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

  // has accumulated cashback, but not available minimum rebate interval
  await truffleAssert.reverts(
    loyalty.cashback({ from: accounts[4], gasPrice: 0 }),
    'E_LOYALTY_CASHBACK_NOT_READY'
  )
}
