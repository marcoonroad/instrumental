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
  const _acceptanceFee = fromEther(0.0005)

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, _acceptanceFee, options)

  const timestamp = now()
  const oldMerchantBalance = toEther(await balanceOf(accounts[3]))
  const oldCustomerBalance = toEther(await balanceOf(accounts[5]))
  const oldLoyaltyBalance = toEther(await balanceOf(loyalty.address))
  const amount = fromEther(2)

  await truffleAssert.reverts(
    loyalty.enter({
      from: accounts[5],
      value: _acceptanceFee * 2,
      gasPrice: 0
    }),
    'E_LOYALTY_INVALID_ACCEPTANCE_FEE'
  )
  await truffleAssert.reverts(
    loyalty.enter({
      from: accounts[5],
      value: _acceptanceFee / 2,
      gasPrice: 0
    }),
    'E_LOYALTY_INVALID_ACCEPTANCE_FEE'
  )
  await truffleAssert.reverts(
    loyalty.enter({
      from: accounts[3],
      value: _acceptanceFee,
      gasPrice: 0
    }),
    'E_LOYALTY_EXCEPT_MERCHANT'
  )

  const txEnter = await loyalty.enter({
    from: accounts[5],
    value: _acceptanceFee,
    gasPrice: 0
  })

  truffleAssert.eventEmitted(txEnter, 'LogLoyaltyAcceptance', event => {
    return (
      event.customer.toString() === accounts[5].toString() &&
      event.loyalty.toString() === loyalty.address.toString() &&
      Number(event.timestamp) >= timestamp
    )
  })

  // customer can't enter twice our loyalty program
  await truffleAssert.reverts(
    loyalty.enter({
      from: accounts[5],
      value: _acceptanceFee,
      gasPrice: 0
    }),
    'E_LOYALTY_ALREADY_ACCEPTED'
  )

  const transferOptions = {
    from: accounts[5],
    value: amount,
    gasPrice: 0
  }

  await timeTravel(35) // seconds
  await truffleAssert.reverts(
    loyalty.sendTransaction({
      from: accounts[5],
      value: 95,
      gasPrice: 0
    }),
    'E_LOYALTY_INVALID_PAYMENT_AMOUNT'
  )

  await truffleAssert.reverts(
    loyalty.sendTransaction({
      from: accounts[3],
      value: _acceptanceFee,
      gasPrice: 0
    }),
    'E_LOYALTY_EXCEPT_MERCHANT'
  )

  // can't pull when merchant balance is 0
  await truffleAssert.reverts(
    loyalty.receive({ from: accounts[3], gasPrice: 0 }),
    'E_LOYALTY_EMPTY_MERCHANT_BALANCE'
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
  await truffleAssert.reverts(
    loyalty.receive({ from: accounts[4], gasPrice: 0 }),
    'E_LOYALTY_ONLY_MERCHANT'
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
    Number(oldLoyaltyBalance) + Number(discountedAmount) + Number(toEther(_acceptanceFee))
  )
  assert.equal(
    Number(newCustomerBalance),
    Number(oldCustomerBalance) - (paidAmount + Number(toEther(_acceptanceFee))) // no cashback yet
  )

  // merchant himself can't enter loyalty program
  await truffleAssert.reverts(
    loyalty.enter({
      from: accounts[3],
      value: _acceptanceFee,
      gasPrice: 0
    }),
    'E_LOYALTY_EXCEPT_MERCHANT'
  )

  // only loyalty club members can accumulate cashbacks
  await truffleAssert.reverts(
    loyalty.sendTransaction({
      from: accounts[8],
      value: fromEther(1.5),
      gasPrice: 0
    }),
    'E_LOYALTY_NON_MEMBER'
  )
}
