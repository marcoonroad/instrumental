pragma solidity 0.4.24;

// dummy/helper interface contract to cover
// fallback method calls on other contracts

contract FallbackMethodCall {

  uint256 public number;

  constructor() public {
    number = 1;
  }

  function methodCall(uint256 _number) public payable {
    number = _number;
  }

}
