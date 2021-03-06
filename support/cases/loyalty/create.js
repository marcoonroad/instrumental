module.exports = async (params) => {
  const Loyalty = params.Loyalty
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const truffleAssert = params.truffleAssert
  const now = params.now
  const toEther = params.toEther

  const oldMerchantBalance = toEther(await balanceOf(accounts[1]))

  const _discountRate = 3
  const _rebateBasis = 2
  const _acceptanceFee = 100

  await truffleAssert.reverts(
    Loyalty.new(10, 6, 50, { from: accounts[1], gasPrice: 0 }),
    'E_LOYALTY_INVALID_DISCOUNT_RATE'
  )
  await truffleAssert.reverts(
    Loyalty.new(3, 18, 50, { from: accounts[1], gasPrice: 0 }),
    'E_LOYALTY_INVALID_REBATE_BASIS'
  )
  await truffleAssert.reverts(
    Loyalty.new(3, 2, 0, { from: accounts[1], gasPrice: 0 }),
    'E_LOYALTY_INVALID_ACCEPTANCE_FEE'
  )
  const timestamp = now()
  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, _acceptanceFee, {
    from: accounts[1],
    gasPrice: 0
  })

  const txLoyalty = await truffleAssert.createTransactionResult(
    loyalty, loyalty.transactionHash
  )

  truffleAssert.eventEmitted(txLoyalty, 'LogLoyaltyProgram', event => {
    return event.merchant === accounts[1] &&
      event.loyalty === loyalty.address &&
      Number(event.timestamp) >= Number(timestamp)
  })

  const newMerchantBalance = toEther(await balanceOf(accounts[1]))
  const loyaltyBalance = toEther(await balanceOf(loyalty.address))
  const rebateBasis = await loyalty.rebateBasis()
  const discountRate = await loyalty.discountRate()
  const acceptanceFee = await loyalty.acceptanceFee()
  const merchant = await loyalty.merchant()

  assert.equal(Number(oldMerchantBalance), Number(newMerchantBalance))
  assert.equal(merchant, accounts[1])
  assert.equal(Number(loyaltyBalance), 0)
  assert.equal(discountRate, _discountRate)
  assert.equal(acceptanceFee, _acceptanceFee)
  assert.equal(rebateBasis, _rebateBasis * 30 * 24 * 60 * 60)
}
