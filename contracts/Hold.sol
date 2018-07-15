pragma solidity ^0.4.22;

// Authorization Hold contract
// a.k.a Preauthorization

contract Hold {

  enum HoldStatus {
    PENDING,
    AUTHORIZED,
    SETTLED,
    REFUNDED
  }

  address public buyer;
  address public seller;
  uint256 public estimatedAmount;
  uint256 public settledAmount;
  uint256 public expiredAt;
  HoldStatus public status;

  event PendingHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event AuthorizedHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event SettledHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event RefundedHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  constructor(
    address _buyer,
    uint256 _estimatedAmount
  ) public {
    require(_buyer != address(0));
    require(msg.sender != _buyer);
    require(_estimatedAmount >= 1);

    seller = msg.sender;
    buyer = _buyer;
    estimatedAmount = _estimatedAmount;
    status = HoldStatus.PENDING;

    address hold = address(this);
    emit PendingHold(seller, hold, buyer, now);
  }

  function authorize(uint256 _expiredAt) public payable {
    require(msg.value == estimatedAmount);
    require(msg.sender == buyer);
    require(_expiredAt >= now + 5 minutes);

    expiredAt = _expiredAt;
    status = HoldStatus.AUTHORIZED;

    address hold = address(this);
    emit AuthorizedHold(seller, hold, buyer, now);
  }

  function refund() public {
    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == buyer);
    require(now > expiredAt);

    buyer.transfer(estimatedAmount);
    status = HoldStatus.REFUNDED;

    address hold = address(this);

    emit RefundedHold(seller, hold, buyer, now);
  }

  function settle(uint256 _settledAmount) public {
    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == seller);
    require(now < expiredAt);
    require(_settledAmount >= 1);
    require(_settledAmount <= estimatedAmount);

    settledAmount = _settledAmount;
    status = HoldStatus.SETTLED;

    address hold = address(this);

    if (settledAmount < estimatedAmount) {
      uint256 remainingAmount = estimatedAmount - settledAmount;
      buyer.transfer(remainingAmount);
    }

    seller.transfer(settledAmount);

    emit SettledHold(seller, hold, buyer, now);
  }

}
