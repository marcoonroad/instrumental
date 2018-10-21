pragma solidity 0.4.24;

import "./Clock.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// contract for a Cashback reward
// under a Loyalty program

contract Loyalty {

  using SafeMath for uint256;

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
    bool isDiscountRateValid = (1 <= _discountRate) && (_discountRate <= 5);
    bool isRebateBasisValid = (1 <= _rebateBasis) && (_rebateBasis <= 12);

    require(isDiscountRateValid, "E_LOYALTY_INVALID_DISCOUNT_RATE");
    require(isRebateBasisValid, "E_LOYALTY_INVALID_REBATE_BASIS");

    merchant = msg.sender;
    rebateBasis = _rebateBasis.mul(30 days);
    discountRate = _discountRate;
    clock = new Clock();

    address loyalty = address(this);

    emit LogLoyaltyProgram(merchant, loyalty, clock.checkedAt());
  }

  function () external payable {
    clock.tick();

    require(msg.data.length == 0, "E_LOYALTY_TRIGGERED_FALLBACK_METHOD");
    require(msg.sender != merchant, "E_LOYALTY_EXCEPT_MERCHANT");
    require(msg.value >= 100, "E_LOYALTY_INVALID_PAYMENT_AMOUNT");

    uint256 customerPart = msg.value.div(100).mul(discountRate);

    balanceOf[msg.sender] = balanceOf[msg.sender].add(customerPart);

    // first customer payment
    if (claimedAt[msg.sender] == 0) {
      claimedAt[msg.sender] = clock.checkedAt();
    }

    uint256 merchantPart = msg.value.sub(customerPart);

    merchantBalance = merchantBalance.add(merchantPart);

    emit LogLoyaltyPayment(msg.sender, clock.checkedAt(), msg.value);
  }

  function receive() public {
    require(msg.sender == merchant, "E_LOYALTY_ONLY_MERCHANT");
    require(merchantBalance > 0, "E_LOYALTY_EMPTY_MERCHANT_BALANCE");

    uint256 merchantPart = merchantBalance;
    merchantBalance = 0;

    merchant.transfer(merchantPart);
  }

  function cashback() public {
    clock.tick();

    require(msg.sender != merchant, "E_LOYALTY_EXCEPT_MERCHANT");

    uint256 customerBalance = balanceOf[msg.sender];
    require(customerBalance > 0, "E_LOYALTY_EMPTY_CUSTOMER_BALANCE");

    uint256 customerClaimDate = claimedAt[msg.sender];
    require(clock.checkedAt().sub(customerClaimDate) > rebateBasis, "E_LOYALTY_CASHBACK_NOT_READY");

    balanceOf[msg.sender] = 0;
    claimedAt[msg.sender] = clock.checkedAt();
    emit LogLoyaltyCashback(msg.sender, clock.checkedAt(), customerBalance);

    msg.sender.transfer(customerBalance);
  }

}
