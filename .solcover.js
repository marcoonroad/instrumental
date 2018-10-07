const nodeExecutable = 'node --max-old-space-size=4096'
const nodeBinaries = 'node_modules/.bin'
const truffleCoverage = 'truffle test --network coverage'

module.exports = {
  norpc: false,
  port: 6545,
  testrpcOptions: '-p 6545',
  compileCommand: `../${nodeBinaries}/truffle compile`,
  testCommand: `${nodeExecutable} ../${nodeBinaries}/${truffleCoverage}`,
  dir: './'
}
