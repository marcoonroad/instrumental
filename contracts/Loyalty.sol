pragma solidity 0.4.24;

import "./Clock.sol";

// contract for a Cashback reward
// under a Loyalty program

contract Loyalty {

  Clock public clock;
  uint256 public rebateBasis;
  uint256 public discountRate;
  address public merchant;
  uint256 public merchantBalance;

  mapping (address => uint256) public balanceOf;
  mapping (address => uint256) public claimedAt;

  event LogLoyaltyProgram(
    address indexed merchant,
    address indexed loyalty,
    uint256 indexed timestamp
  );

  event LogLoyaltyPayment(
    address indexed customer,
    uint256 indexed timestamp,
    uint256 indexed amount
  );

  event LogLoyaltyCashback(
    address indexed customer,
    uint256 indexed timestamp,
    uint256 indexed reward
  );

  constructor(
    uint256 _discountRate,
    uint256 _rebateBasis
  ) public {
    require(1 <= _discountRate && _discountRate <= 5);
    require(1 <= _rebateBasis && _rebateBasis <= 12);

    merchant = msg.sender;
    rebateBasis = _rebateBasis * 30 days;
    discountRate = _discountRate;
    clock = new Clock();

    address loyalty = address(this);

    emit LogLoyaltyProgram(merchant, loyalty, clock.checkedAt());
  }

  function () external payable {
    clock.tick();

    require(msg.data.length == 0);
    require(msg.sender != merchant);
    require(msg.value >= 100);

    uint256 customerBalance = balanceOf[msg.sender];

    uint256 customerPart = (msg.value / 100) * discountRate;
    require(customerBalance + customerPart > 0);

    balanceOf[msg.sender] += customerPart;

    // first customer payment
    if (claimedAt[msg.sender] == 0) {
      claimedAt[msg.sender] = clock.checkedAt();
    }

    uint256 merchantPart = msg.value - customerPart;
    require(merchantBalance + merchantPart > 0);
    merchantBalance += merchantPart;

    emit LogLoyaltyPayment(msg.sender, clock.checkedAt(), msg.value);
  }

  function receive() public {
    require(msg.sender == merchant);
    require(merchantBalance > 0);

    uint256 merchantPart = merchantBalance;
    merchantBalance = 0;

    merchant.transfer(merchantPart);
  }

  function cashback() public {
    clock.tick();

    require(msg.sender != merchant);

    uint256 customerBalance = balanceOf[msg.sender];
    require(customerBalance > 0);

    uint256 customerClaimDate = claimedAt[msg.sender];
    require(clock.checkedAt() - customerClaimDate > rebateBasis);

    balanceOf[msg.sender] = 0;
    claimedAt[msg.sender] = clock.checkedAt();
    emit LogLoyaltyCashback(msg.sender, clock.checkedAt(), customerBalance);

    msg.sender.transfer(customerBalance);
  }

}
