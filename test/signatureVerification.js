'use strict'

/* eslint-env node, es6, mocha */
/* global artifacts, contract, assert */

const {
  balanceOf, toEther, fromEther
} = require('../support/account')

const {
  getMessageHash, verifySignature, signMessage
} = require('../support/signatureUtils')

const {
  timeTravel, now
} = require('../support/block')

const SignatureVerification = artifacts.require('./SignatureVerification.sol')
const FallbackMethodCall = artifacts.require('./helpers/FallbackMethodCall.sol')
const truffleAssert = require('../support/assertions')

contract('SignatureVerification', accounts => {
  let contract;
  // const [deployer, trustedSigner, untrustedSigner] = accounts;

  // Move the setup to a fixture
  beforeEach(async () => {
    const signature = await signMessage(accounts[0], getMessageHash(accounts[0]))
    contract = await SignatureVerification.new(signature)
  })

  it('should verify the trusted signer signature', async () => {
    const message = accounts[0];
    const messageHash = getMessageHash(message);

    // Sign the message
    const signature = await signMessage(accounts[0], messageHash);

    // Verify on-chain
    // const isValid = await contract.verifySignature(messageHash, signature, { from: accounts[1] })
    const isValid = await contract.verifyContract({ from: accounts[1] })
    assert.isTrue(isValid, 'The signature from trusted signer should be valid')
  });

  it('should fail verification for an untrusted signer', async () => {
    const message = 'Untrusted message';
    const messageHash = getMessageHash(message);

    // Untrusted signer signs
    // const signature = await signMessage(untrustedSigner, messageHash)

    // Verify on-chain
    // const isValid = await contract.verifySignature(messageHash, signature, { from: deployer })
    // assert.isFalse(isValid, 'The signature from untrusted signer should be invalid')
  })

  it('should perform an off-chain signature verification', async () => {
    const signerAddress = accounts[0] // The address of the signer
    const message = "Verify this message"

    // Step 1: Hash the message (web3 automatically prepends Ethereum-specific prefix)
    // const messageHash = web3.utils.sha3(message)
    const messageHash = getMessageHash(message)

    // Step 2: Sign the message
    // const signature = await web3.eth.sign(messageHash, signerAddress)
    const signature = await signMessage(signerAddress, messageHash)
    assert.isTrue(await verifySignature(signerAddress, messageHash, signature))
    // Step 3: Recover the signer's address from the signature
    // const recoveredAddress = web3.eth.accounts.recover(messageHash, signature)
    // Step 4: Compare the recovered address with the original signer address
    // assert.areEqual(recoveredAddress.toLowerCase(), signerAddress.toLowerCase())
  })
})
