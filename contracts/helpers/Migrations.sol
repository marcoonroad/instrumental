pragma solidity 0.4.24;

// Migrations Meta Smart Contract
// Versioning of implemented Contracts

contract Migrations {

  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    require(msg.sender == owner, "E_MIGRATIONS_ONLY_OWNER");
    _;
  }

  constructor() public {
    owner = msg.sender;
  }

  function setCompleted(uint256 completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address newAddress) public restricted {
    bool isNewAddressValid = (newAddress != address(0)) &&
      (newAddress != address(this));

    require(isNewAddressValid, "E_MIGRATIONS_INVALID_NEW_ADDRESS");

    Migrations upgraded = Migrations(newAddress);
    upgraded.setCompleted(last_completed_migration);
  }

}
