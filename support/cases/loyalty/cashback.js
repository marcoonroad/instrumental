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

  const options = {
    from: accounts[7],
    gasPrice: 0
  }

  const _discountRate = 1
  const _rebateBasis = 12

  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, options)

  const oldCustomerBalance = toEther(Number(await balanceOf(accounts[4])))
  const oldMerchantBalance = toEther(Number(await balanceOf(accounts[7])))

  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(3),
    gasPrice: 0
  })

  await loyalty.sendTransaction({
    from: accounts[4],
    value: fromEther(1),
    gasPrice: 0
  })

  const skipTime = now() + (12 * 30 * 24 * 60 * 60)
  await timeTravel(skipTime)

  await truffleAssert.fails(
    loyalty.cashback({ from: accounts[5] }),
    truffleAssert.ErrorType.REVERT
  )

  const timestamp = now()
  const txCashback = await loyalty.cashback({ from: accounts[4], gasPrice: 0 })

  const newCustomerBalance = toEther(Number(await balanceOf(accounts[4])))
  const newMerchantBalance = toEther(Number(await balanceOf(accounts[7])))

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
}
