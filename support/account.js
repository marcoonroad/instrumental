'use strict'

/* global web3 */

const balanceOf = async account => {
  const balance = await web3.eth.getBalance(account)

  return balance.toNumber()
}

module.exports = {
  balanceOf
}
