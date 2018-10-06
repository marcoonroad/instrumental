module.exports = async (params) => {
  const Loyalty = params.Loyalty
  const assert = params.assert
  const accounts = params.accounts
  const balanceOf = params.balanceOf
  const truffleAssert = params.truffleAssert
  const now = params.now

  const oldMerchantBalance = await balanceOf(accounts[1])

  const options = {
    from: accounts[1]
  }

  const _discountRate = 3
  const _rebateBasis = 2

  const timestamp = now()
  const loyalty = await Loyalty.new(_discountRate, _rebateBasis, options)

  const txLoyalty = await truffleAssert.createTransactionResult(
    loyalty, loyalty.transactionHash
  )

  truffleAssert.eventEmitted(txLoyalty, 'LogLoyaltyProgram', event => {
    return event.merchant === accounts[1] &&
      event.loyalty === loyalty.address &&
      event.timestamp >= timestamp
  })

  const newMerchantBalance = await balanceOf(accounts[1])
  const rebateBasis = await loyalty.rebateBasis()
  const discountRate = await loyalty.discountRate()
  const merchant = await loyalty.merchant()

  assert.isAbove(oldMerchantBalance, newMerchantBalance)
  assert.equal(merchant, accounts[1])
  assert.equal(await balanceOf(loyalty.address), 0)
  assert.equal(discountRate, _discountRate)
  assert.equal(rebateBasis, _rebateBasis * 30 * 24 * 60 * 60)
}
