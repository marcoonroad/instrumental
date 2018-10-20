pragma solidity 0.4.24;

import "./Clock.sol";

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

  Clock public clock;
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
    require(_buyer != address(this));
    require(msg.sender != _buyer);
    require(_estimatedAmount >= 1);

    seller = msg.sender;
    buyer = _buyer;
    estimatedAmount = _estimatedAmount;
    status = HoldStatus.PENDING;
    clock = new Clock();

    address hold = address(this);
    emit LogPendingHold(seller, hold, buyer, clock.checkedAt());
  }

  function authorize(uint256 _expiredAt) public payable {
    clock.tick();

    require(msg.value == estimatedAmount);
    require(msg.sender == buyer);
    require(_expiredAt > clock.checkedAt() + 24 hours);
    require(_expiredAt < clock.checkedAt() + 30 days);

    expiredAt = _expiredAt;
    status = HoldStatus.AUTHORIZED;

    address hold = address(this);
    emit LogAuthorizedHold(seller, hold, buyer, clock.checkedAt());
  }

  function refund() public {
    clock.tick();

    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == buyer);
    require(clock.checkedAt() > expiredAt);

    status = HoldStatus.REFUNDED;

    buyer.transfer(estimatedAmount);

    address hold = address(this);

    emit LogRefundedHold(seller, hold, buyer, clock.checkedAt());
  }

  function settle(uint256 _settledAmount) public {
    clock.tick();

    require(status == HoldStatus.AUTHORIZED);
    require(msg.sender == seller);
    require(clock.checkedAt() < expiredAt);
    require(_settledAmount >= 1);
    require(_settledAmount <= estimatedAmount);

    settledAmount = _settledAmount;
    status = HoldStatus.SETTLED;

    seller.transfer(settledAmount);

    address hold = address(this);
    emit LogSettledHold(seller, hold, buyer, clock.checkedAt());
  }

  function redeem() public {
    clock.tick();

    require(msg.sender == buyer);
    require(status == HoldStatus.SETTLED);
    require(settledAmount < estimatedAmount);

    status = HoldStatus.REDEEMED;

    uint256 remainingAmount = estimatedAmount - settledAmount;
    buyer.transfer(remainingAmount);

    address hold = address(this);

    emit LogRedeemedHold(seller, hold, buyer, clock.checkedAt());
  }

}
