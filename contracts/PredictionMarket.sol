pragma solidity ^0.8.0;

contract PredictionMarket {
    enum Outcome { Win, Draw, Lose }
    struct Bet {
        uint amount;
        Outcome outcome;
    }

    mapping(address => Bet) public bets;
    mapping(Outcome => uint) public totalBets;
    address public owner;
    bool public isBettingOpen = true;
    Outcome public winningOutcome;
    uint public houseFeePercent = 1;
    uint public totalHouseFee;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier bettingOpen() {
        require(isBettingOpen, "Betting is closed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function placeBet(Outcome _outcome) external payable bettingOpen {
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(bets[msg.sender].amount == 0, "You have already placed a bet");

        uint fee = (msg.value * houseFeePercent) / 100;
        uint betAmount = msg.value - fee;
        totalHouseFee += fee;

        bets[msg.sender] = Bet(betAmount, _outcome);
        totalBets[_outcome] += betAmount;
    }

    function closeBetting() external onlyOwner bettingOpen {
        isBettingOpen = false;
    }

    function setWinningOutcome(Outcome _winningOutcome) external onlyOwner {
        require(!isBettingOpen, "Betting is still open");
        winningOutcome = _winningOutcome;
    }

    function claimWinnings() external {
        Bet storage userBet = bets[msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(winningOutcome == userBet.outcome, "You did not bet on the winning outcome");

        uint totalLostBets = totalBets[Outcome.Win] + totalBets[Outcome.Draw] + totalBets[Outcome.Lose] - totalBets[winningOutcome];
        uint winnings = userBet.amount + (userBet.amount * totalLostBets) / totalBets[winningOutcome];

        userBet.amount = 0;
        payable(msg.sender).transfer(winnings);
    }

    function withdrawHouseFees() external onlyOwner {
        uint feeAmount = totalHouseFee;
        totalHouseFee = 0;
        payable(owner).transfer(feeAmount);
    }

    //
    // How odds (o) are calculated, where o = W | D | L:
    //  = 1 + (((W + D + L) - o) / o)
    //  = (W + D + L) / o
    //
    // The function below returns the odd multiplier in percent above 100, so
    // a returned odd of 170 means an odd multiplier of 1.7x
    //

    function getOdds(Outcome _outcome) external view returns (uint) {
        uint totalPool = totalBets[Outcome.Win] + totalBets[Outcome.Draw] + totalBets[Outcome.Lose];
        if (totalBets[_outcome] == 0) {
            return 0; // To avoid division by zero
        }
        return (totalPool * 100) / totalBets[_outcome];
    }
}
