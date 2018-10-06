module.exports = async (params) => {
  const Loyalty = params.Loyalty
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const fromEther = params.fromEther
  const toEther = params.toEther
  const truffleAssert = params.truffleAssert
  const now = params.now

  const options = {
    from: accounts[3],
    gasPrice: 0
  }

  const _discountRate = 5
  const _rebateBasis = 1

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, options)

  const timestamp = now()
  const oldMerchantBalance = await balanceOf(accounts[3])
  const oldCustomerBalance = await balanceOf(accounts[5])
  const oldLoyaltyBalance = await balanceOf(loyalty.address)
  const amount = fromEther(2)

  const transferOptions = {
    from: accounts[5],
    value: amount,
    gasPrice: 0
  }

  const txTransfer = await loyalty.sendTransaction(transferOptions)

  truffleAssert.eventEmitted(txTransfer, 'LogLoyaltyPayment', event => {
    return (
      event.customer.toString() === accounts[5].toString() &&
      event.amount.toString() === fromEther('2') &&
      Number(event.timestamp) >= timestamp
    )
  })

  const newMerchantBalance = await balanceOf(accounts[3])
  const newCustomerBalance = await balanceOf(accounts[5])
  const newLoyaltyBalance = await balanceOf(loyalty.address)

  assert.isAbove(newMerchantBalance, oldMerchantBalance)
  assert.isBelow(newCustomerBalance, oldCustomerBalance)
  assert.isAbove(newLoyaltyBalance, oldLoyaltyBalance)

  const paidAmount = 2
  const discountedAmount = 2 * 0.05
  const merchantAmount = paidAmount - discountedAmount

  assert.equal(
    Number(toEther(newMerchantBalance)),
    Number(toEther(oldMerchantBalance)) + Number(merchantAmount)
  )
  assert.equal(
    Number(toEther(newLoyaltyBalance)),
    Number(toEther(oldLoyaltyBalance)) + Number(discountedAmount)
  )

  await truffleAssert.fails(
    loyalty.sendTransaction({ from: accounts[3], value: fromEther(1.2) }),
    truffleAssert.ErrorType.REVERT
  )
}
