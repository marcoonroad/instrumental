pragma solidity 0.4.24;

// reliable clock which fails when owner is
// depending on a 30-seconds time-drift logic

contract Clock {

  address public owner;
  uint256 public checkedAt;

  constructor() public {
    owner = msg.sender;
    checkedAt = block.timestamp;
  }

  function tick() public {
    require(msg.sender == owner);
    require(checkedAt + 30 seconds <= block.timestamp);

    checkedAt = block.timestamp;
  }

}
