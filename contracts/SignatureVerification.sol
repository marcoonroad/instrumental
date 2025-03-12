pragma solidity ^0.8.0;

contract SignatureVerification {

    address public trustedDeveloper; // The address of the trusted developer
    bytes32 public messageHash;
    bytes public signature;

    constructor(bytes memory _signature) public {
        trustedDeveloper = msg.sender();
        messageHash = oldGetMessageHash(trustedDeveloper);
        signature = signature;
    }

    // constructor(address _trustedDeveloper) {
    //    trustedDeveloper = _trustedDeveloper;
    // }

    // function verifyContract() public view returns (bool) {
    //    return verifySignature(messageHash, signature);
    // }

    function newVerifySignature(address _signer, bytes memory _signedMessage) public pure returns (bool) {
        require(_signedMessage.length == 84, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        bytes32 messageHash = keccak256(_signedMessage[:32]);
        assembly {
            r := mload(add(_signedMessage, 32))
            s := mload(add(_signedMessage, 64))
            v := byte(0, mload(add(_signedMessage, 96)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature 'v' value");
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = ecrecover(prefixedHash, v, r, s);
        return recoveredSigner == _signer;
    }

    function oldVerifySignature(bytes32 _messageHash, bytes memory _signature) public view returns (bool) {
        // Extract r, s, and v from the signature
        bytes32 r;
        bytes32 s;
        uint8 v;
        // Signature is 65 bytes long, we split it accordingly
        // v is the last byte, r is the first 32 bytes, s is the next 32 bytes
        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }
        // Now we use ecrecover to recover the signer address from the signature
        address recoveredAddress = ecrecover(_messageHash, v, r, s);
        // Check if the recovered address is the trusted developer
        return (recoveredAddress == trustedDeveloper);
    }

    function oldGetMessageHash(string memory _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }
}
