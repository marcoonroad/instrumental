/* global web3 */

const jsonrpc = '2.0'
const id = 0

const send = (method, params = []) =>
  web3.currentProvider.send({ id, jsonrpc, method, params })

const timeTravel = async seconds => {
  await send('evm_increaseTime', [seconds])
  await send('evm_mine')
}

const now = () => Math.floor((new Date()).getTime() / 1000)

module.exports.timeTravel = timeTravel
module.exports.now = now
