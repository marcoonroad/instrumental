const truffleAssert = require('truffle-assertions')

const reverts = (promise, reason) => {
  if (process.env.SOLIDITY_COVERAGE) reason = undefined // hack / workaround

  return truffleAssert.reverts(promise, reason)
}

const createTransactionResult = truffleAssert.createTransactionResult
const eventEmitted = truffleAssert.eventEmitted

module.exports.reverts = reverts
module.exports.createTransactionResult = createTransactionResult
module.exports.eventEmitted = eventEmitted
