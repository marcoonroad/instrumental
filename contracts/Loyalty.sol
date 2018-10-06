pragma solidity 0.4.24;

// contract for a Cashback reward
// under a Loyalty program

contract Loyalty {

  uint256 public rebateBasis;
  uint256 public discountRate;
  address public merchant;

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

    address loyalty = address(this);

    emit LogLoyaltyProgram(merchant, loyalty, block.timestamp);
  }

  function () external payable {
    require(msg.sender != merchant);
    require(msg.value >= 100);

    uint256 customerBalance = balanceOf[msg.sender];

    uint256 customerPart = (msg.value / 100) * discountRate;
    require(customerBalance + customerPart > 0);

    balanceOf[msg.sender] += customerPart;

    uint256 merchantPart = msg.value - customerPart;
    emit LogLoyaltyPayment(msg.sender, block.timestamp, msg.value);

    merchant.transfer(merchantPart);
  }

  function cashback() public {
    require(msg.sender != merchant);

    uint256 customerBalance = balanceOf[msg.sender];
    require(customerBalance > 0);

    uint256 customerClaimDate = claimedAt[msg.sender];
    require(block.timestamp - customerClaimDate > rebateBasis);

    balanceOf[msg.sender] = 0;
    emit LogLoyaltyCashback(msg.sender, block.timestamp, customerBalance);

    msg.sender.transfer(customerBalance);
  }

}
