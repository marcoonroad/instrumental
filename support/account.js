/* global web3 */

const balanceOf = async account => {
  const balance = await web3.eth.getBalance(account)

  return balance.toNumber()
}

const toEther = amount => web3.fromWei(amount, 'ether')
const fromEther = amount => web3.toWei(amount, 'ether')

module.exports = {
  balanceOf,
  toEther,
  fromEther
}
