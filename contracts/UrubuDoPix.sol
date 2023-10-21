pragma solidity 0.4.24;

import "./Clock.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract UrubuDoPix {
    using SafeMath for uint256;

    Clock public scamClock;
    address public scamOwner;
    address public scamContract;
    mapping (uint256 => uint256) public tabelaTradingRetorno;
    uint256 public scamBalance;

    event LogUrubuDoPixScam(
        address indexed scamOwner,
        address indexed scamContract,
        uint256 indexed scamTimestamp
    );

    event LogUrubuDoPixFool(
        address indexed fool,
        uint256 indexed timestamp,
        uint256 indexed amount
    );

    constructor() public {
        scamOwner = msg.sender;
        scamClock = new Clock();
        scamContract = address(this);
        scamBalance = 0;

        tabelaTradingRetorno[200] = 2000;
        tabelaTradingRetorno[250] = 2500;
        tabelaTradingRetorno[300] = 3000;
        tabelaTradingRetorno[350] = 3500;
        tabelaTradingRetorno[400] = 4000;
        tabelaTradingRetorno[500] = 5000;

        uint256 scamTimestamp = scamClock.checkedAt();

        emit LogUrubuDoPixScam(scamOwner, scamContract, scamTimestamp);
    }

    function () external payable {
        require(msg.data.length == 0, "E_URUBU_DO_PIX_TRIGGERED_FALLBACK_METHOD");
        require(msg.sender != scamOwner, "E_URUBU_DO_PIX_EXCEPT_SCAM_OWNER");
        require(msg.sender != scamContract, "E_URUBU_DO_PIX_EXCEPT_SCAM_CONTRACT");
        require(tabelaTradingRetorno[msg.value] != 0, "E_URUBU_DO_PIX_INVALID_PAYMENT_AMOUNT");
        
        scamClock.tick();
        scamBalance = scamBalance.add(msg.value);

        emit LogUrubuDoPixFool(msg.sender, scamClock.checkedAt(), msg.value);
    }

    function rugpull() public {
        require(msg.sender == scamOwner, "E_URUBU_DO_PIX_ONLY_SCAM_OWNER");
        require(scamBalance > 0, "E_URUBU_DO_PIX_EMPTY_SCAM_BALANCE");

        uint256 rugpullValue = scamBalance;
        scamBalance = 0;

        scamOwner.transfer(rugpullValue);
    }
}