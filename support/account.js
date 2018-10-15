/* global web3 */

const balanceOf = async account => {
  const balance = await web3.eth.getBalance(account)

  return web3.toDecimal(balance)
}

const transfer = (from, to, value) => {
  const options = { from, to, value }

  return web3.eth.sendTransaction(options)
}

const toEther = amount => web3.fromWei(amount, 'ether')
const fromEther = amount => web3.toWei(amount, 'ether')

module.exports = {
  balanceOf,
  toEther,
  fromEther,
  transfer
}
