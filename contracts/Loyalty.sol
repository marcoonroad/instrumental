pragma solidity 0.4.24;

import "./Clock.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// contract for a Cashback reward
// under a Loyalty program

contract Loyalty {

  using SafeMath for uint256;

  uint256 public rebateBasis;
  uint256 public discountRate;
  uint256 public acceptanceFee;
  address public merchant;
  uint256 public merchantBalance;

  mapping (address => uint256) public balanceOf;
  mapping (address => uint256) public claimedAt;
  mapping (address => Clock) public clockFor;

  event LogLoyaltyProgram(
    address indexed merchant,
    address indexed loyalty,
    uint256 indexed timestamp
  );

  event LogLoyaltyAcceptance(
    address indexed customer,
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
    uint256 _rebateBasis,
    uint256 _acceptanceFee
  ) public {
    bool isDiscountRateValid = (1 <= _discountRate) && (_discountRate <= 5);
    bool isRebateBasisValid = (1 <= _rebateBasis) && (_rebateBasis <= 12);

    // TODO: check that better
    bool isAcceptanceFeeValid = _acceptanceFee > 0;

    require(isDiscountRateValid, "E_LOYALTY_INVALID_DISCOUNT_RATE");
    require(isRebateBasisValid, "E_LOYALTY_INVALID_REBATE_BASIS");
    require(isAcceptanceFeeValid, "E_LOYALTY_INVALID_ACCEPTANCE_FEE");

    merchant = msg.sender;
    rebateBasis = _rebateBasis.mul(30 days);
    discountRate = _discountRate;
    acceptanceFee = _acceptanceFee;

    Clock clock = new Clock();
    uint256 timestamp = clock.checkedAt();

    address loyalty = address(this);
    clock.dispose();

    emit LogLoyaltyProgram(merchant, loyalty, timestamp);
  }

  function enter () external payable {
    require(msg.sender != merchant, "E_LOYALTY_EXCEPT_MERCHANT");
    require(claimedAt[msg.sender] == 0, "E_LOYALTY_ALREADY_ACCEPTED");
    require(msg.value == acceptanceFee, "E_LOYALTY_INVALID_ACCEPTANCE_FEE");

    Clock clock = new Clock();
    uint256 timestamp = clock.checkedAt();

    clockFor[msg.sender] = clock;
    claimedAt[msg.sender] = timestamp;

    address loyalty = address(this);

    emit LogLoyaltyAcceptance(msg.sender, loyalty, timestamp);
  }

  function () external payable {
    require(msg.data.length == 0, "E_LOYALTY_TRIGGERED_FALLBACK_METHOD");
    require(msg.sender != merchant, "E_LOYALTY_EXCEPT_MERCHANT");
    require(claimedAt[msg.sender] != 0, "E_LOYALTY_NON_MEMBER");
    require(msg.value >= 100, "E_LOYALTY_INVALID_PAYMENT_AMOUNT");

    Clock clock = clockFor[msg.sender];
    clock.tick();

    uint256 customerPart = msg.value.div(100).mul(discountRate);
    balanceOf[msg.sender] = balanceOf[msg.sender].add(customerPart);

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
    require(msg.sender != merchant, "E_LOYALTY_EXCEPT_MERCHANT");
    require(claimedAt[msg.sender] != 0, "E_LOYALTY_NON_MEMBER");

    uint256 customerBalance = balanceOf[msg.sender];
    require(customerBalance > 0, "E_LOYALTY_EMPTY_CUSTOMER_BALANCE");

    Clock clock = clockFor[msg.sender];
    clock.tick();
    uint256 customerClaimDate = claimedAt[msg.sender];
    require(clock.checkedAt().sub(customerClaimDate) > rebateBasis, "E_LOYALTY_CASHBACK_NOT_READY");

    balanceOf[msg.sender] = 0;
    claimedAt[msg.sender] = clock.checkedAt();
    emit LogLoyaltyCashback(msg.sender, clock.checkedAt(), customerBalance);

    msg.sender.transfer(customerBalance);
  }

}
