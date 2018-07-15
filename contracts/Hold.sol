pragma solidity 0.4.24;

// Authorization Hold contract
// a.k.a Preauthorization

contract Hold {

  enum HoldStatus {
    PENDING,
    AUTHORIZED,
    SETTLED,
    REDEEMED,
    REFUNDED
  }

  address public buyer;
  address public seller;
  uint256 public estimatedAmount;
  uint256 public settledAmount;
  uint256 public expiredAt;
  HoldStatus public status;

  event LogPendingHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event LogAuthorizedHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event LogSettledHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event LogRedeemedHold(
    address indexed seller,
    address indexed hold,
    address indexed buyer,
    uint256 timestamp
  );

  event LogRefundedHold(
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
    emit LogPendingHold(seller, hold, buyer, block.timestamp);
  }

  function authorize(uint256 _expiredAt) public payable {
    require(msg.value == estimatedAmount);
    require(msg.sender == buyer);
    require(_expiredAt >= block.timestamp + 5 minutes);

    expiredAt = _expiredAt;
    status = HoldStatus.AUTHORIZED;

    address hold = address(this);
    emit LogAuthorizedHold(seller, hold, buyer, block.timestamp);
  }

  function refund() public {
    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == buyer);
    require(block.timestamp > expiredAt);

    buyer.transfer(estimatedAmount);
    status = HoldStatus.REFUNDED;

    address hold = address(this);

    emit LogRefundedHold(seller, hold, buyer, block.timestamp);
  }

  function settle(uint256 _settledAmount) public {
    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == seller);
    require(block.timestamp < expiredAt);
    require(_settledAmount >= 1);
    require(_settledAmount <= estimatedAmount);

    settledAmount = _settledAmount;
    status = HoldStatus.SETTLED;

    seller.transfer(settledAmount);

    address hold = address(this);
    emit LogSettledHold(seller, hold, buyer, block.timestamp);
  }

  function redeem() public {
    require(msg.sender == buyer);
    require(status == HoldStatus.SETTLED);
    require(settledAmount < estimatedAmount);

    status = HoldStatus.REDEEMED;

    uint256 remainingAmount = estimatedAmount - settledAmount;
    buyer.transfer(remainingAmount);

    address hold = address(this);

    emit LogRedeemedHold(seller, hold, buyer, block.timestamp);
  }

}
