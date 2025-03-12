/* global web3 */

// const web3 = require('web3')
// const { ethers } = require('ethers')

/**
 * @function
 * @summary Hash a message using keccak256 (same as Solidity's keccak256)
 * @description Hash a message using keccak256 (same as Solidity's keccak256)
 * @param {string} message 
 * @returns {any}
 */
function oldGetMessageHash(message) {
  // return ethers.utils.solidityKeccak256(["string"], [message])
  return web3.utils.soliditySha3(message)
}

/**
 * @function
 * @description Sign a message using an account's private key
 * @summary Sign a message using an account's private key
 * @param {any} signer 
 * @param {any} messageHash 
 * @returns {Promise<any>}
 */
async function oldSignMessage(signer, messageHash) {
  // ethers.Signers interface allows signing via private key or account
  const signature = await web3.eth.sign(messageHash, signer)
  return signature
}

async function newSignMessage (senderAddress, payload) {
  const messageHash = web3.utils.sha3(payload);
  const signature = await web3.eth.sign(messageHash, senderAddress);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  const signedMessage = messageHash + r.slice(2) + s.slice(2) + v.toString(16).padStart(2, '0');
  return signedMessage;
}

async function newVerifySignature(message, signature, expectedSigner) {
  const messageHash = web3.utils.sha3(message);
  const prefixedHash = web3.utils.soliditySha3(
      "\x19Ethereum Signed Message:\n32",
      messageHash
  );
  const recoveredAddress = web3.eth.accounts.recover(prefixedHash, signature);
  return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
}

/**
 * @function
 * @summary Compare the recovered address with the original signer address
 * @description Compare the recovered address with the original signer address
 * @param {any} signer 
 * @param {any} messageHash 
 * @param {any} signature 
 * @returns {Promise<boolean>}
 */
async function oldVerifySignature(signer, messageHash, signature) {
    let recoveredAddress = web3.eth.accounts.recover(messageHash, signature)
    if (recoveredAddress instanceof Promise || recoveredAddress.then) {
        recoveredAddress = await recoveredAddress
    }
    return recoveredAddress.toLowerCase() === signer.toLowerCase()
}

module.exports = {
  newSignMessage,
  newVerifySignature,
  oldGetMessageHash,
  oldVerifySignature,
  oldSignMessage
}
