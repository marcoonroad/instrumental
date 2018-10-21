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
    bool isBuyerValid = (_buyer != address(0)) &&
      (_buyer != address(this)) && (msg.sender != _buyer);

    require(isBuyerValid, "E_HOLD_INVALID_BUYER");
    require(_estimatedAmount >= 1, "E_HOLD_INVALID_ESTIMATED_AMOUNT");

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

    require(msg.value == estimatedAmount, "E_HOLD_INVALID_AUTHORIZED_AMOUNT");
    require(msg.sender == buyer, "E_HOLD_ONLY_BUYER");

    bool isExpirationValid = (_expiredAt > clock.checkedAt() + 24 hours) &&
      (_expiredAt < clock.checkedAt() + 30 days);

    require(isExpirationValid, "E_HOLD_INVALID_EXPIRATION");

    expiredAt = _expiredAt;
    status = HoldStatus.AUTHORIZED;

    address hold = address(this);
    emit LogAuthorizedHold(seller, hold, buyer, clock.checkedAt());
  }

  function refund() public {
    clock.tick();

    require(status == HoldStatus.AUTHORIZED, "E_HOLD_NOT_AUTHORIZED");
    require(msg.sender == buyer, "E_HOLD_ONLY_BUYER");
    require(clock.checkedAt() > expiredAt, "E_HOLD_NOT_EXPIRED");

    status = HoldStatus.REFUNDED;

    buyer.transfer(estimatedAmount);

    address hold = address(this);

    emit LogRefundedHold(seller, hold, buyer, clock.checkedAt());
  }

  function settle(uint256 _settledAmount) public {
    clock.tick();

    require(status == HoldStatus.AUTHORIZED, "E_HOLD_NOT_AUTHORIZED");
    require(msg.sender == seller, "E_HOLD_ONLY_SELLER");
    require(clock.checkedAt() < expiredAt, "E_HOLD_EXPIRED");

    bool isSettledAmountValid = (_settledAmount >= 1) &&
      (_settledAmount <= estimatedAmount);

    require(isSettledAmountValid, "E_HOLD_INVALID_SETTLED_AMOUNT");

    settledAmount = _settledAmount;
    status = HoldStatus.SETTLED;

    seller.transfer(settledAmount);

    address hold = address(this);
    emit LogSettledHold(seller, hold, buyer, clock.checkedAt());
  }

  function redeem() public {
    clock.tick();

    require(msg.sender == buyer, "E_HOLD_ONLY_BUYER");
    require(status == HoldStatus.SETTLED, "E_HOLD_NOT_SETTLED");
    require(settledAmount < estimatedAmount, "E_HOLD_NOT_REDEEMABLE");

    status = HoldStatus.REDEEMED;

    uint256 remainingAmount = estimatedAmount - settledAmount;
    buyer.transfer(remainingAmount);

    address hold = address(this);

    emit LogRedeemedHold(seller, hold, buyer, clock.checkedAt());
  }

}
