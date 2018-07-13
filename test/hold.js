/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert, web3 */

const Hold = artifacts.require('./Hold.sol')

contract('Hold', function (accounts) {
  const HoldStatus = {
    PENDING: 0,
    AUTHORIZED: 1,
    SETTLED: 2,
    REFUNDED: 3
  }

  const balanceOf = async account => {
    const balance = await web3.eth.getBalance(account)

    return balance.toNumber()
  }

  it('should create a hold', async () => {
    const balance1A = await balanceOf(accounts[1])
    const balance2A = await balanceOf(accounts[2])

    const options = {
      from: accounts[1]
    }

    const hold = await Hold.new(accounts[2], 200, options)

    const balance1B = await balanceOf(accounts[1])
    const balance2B = await balanceOf(accounts[2])
    const balanceB = await balanceOf(hold.address)

    assert.isAbove(balance1A, balance1B)
    assert.equal(balance2A, balance2B)
    assert.equal(balanceB, 0)

    const estimatedAmount = await hold.estimatedAmount()
    const buyer = await hold.buyer()
    const seller = await hold.seller()
    const status = await hold.status()

    const balance1C = await balanceOf(accounts[1])
    const balance2C = await balanceOf(accounts[2])

    assert.equal(balance1B, balance1C)
    assert.equal(balance2B, balance2C)

    assert.equal(estimatedAmount, 200)
    assert.equal(buyer, accounts[2])
    assert.equal(seller, accounts[1])
    assert.equal(status.toNumber(), HoldStatus.PENDING)
  })

  it('should authorize a hold', async () => {
    const balance2A = await balanceOf(accounts[2])
    const balance3A = await balanceOf(accounts[3])

    const options1 = {
      from: accounts[2]
    }

    const hold = await Hold.new(accounts[3], 350, options1)

    const balance2B = await balanceOf(accounts[2])
    const balance3B = await balanceOf(accounts[3])
    const balanceB = await balanceOf(hold.address)

    assert.isAbove(balance2A, balance2B)
    assert.equal(balance3B, balance3A)
    assert.equal(balanceB, 0)

    const options2 = {
      from: accounts[3],
      value: 350
    }

    const time = (new Date()).getTime() + (10 * 60 * 60 * 1000)

    await hold.authorize(time, options2)

    const status = await hold.status()
    const expiredAt = await hold.expiredAt()

    const balance2C = await balanceOf(accounts[2])
    const balance3C = await balanceOf(accounts[3])
    const balanceC = await balanceOf(hold.address)

    assert.equal(balance2C, balance2B)
    assert.isAbove(balance3B, balance3C)
    assert.equal(balanceC, 350)

    assert.equal(status.toNumber(), HoldStatus.AUTHORIZED)
    assert.equal(expiredAt, time)
  })

  it.skip('should settle a hold', async () => {
  })
})
