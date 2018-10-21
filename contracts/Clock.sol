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
    require(msg.sender == owner, "E_CLOCK_ONLY_OWNER");
    require(checkedAt + 30 seconds <= block.timestamp, "E_CLOCK_TIME_DRIFT");

    checkedAt = block.timestamp;
  }

}
