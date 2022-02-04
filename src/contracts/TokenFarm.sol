pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";


contract TokenFarm {
    string public name = "BroccFi Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    mapping(address => uint) public stakingBalance;
    // for issuing rewards to stakers
    address[] public stakers;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    

    // pass address of DappToken and DaiToken address into state variables for TokenFarm to access
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // stake (deposit) mDAI tokens 
    function stakeTokens(uint _amount) public {
        require(_amount > 0, "amount cannot be 0");

        // investor's wallet to tokenFarm contract 
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // track balance of each address 
        stakingBalance[msg.sender] += _amount;
        // stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // issuing tokens to stakers - as interest for depositing
    function issueTokens() public {
        require(msg.sender == owner, "only owner can issue tokens");

        for(uint i=0; i <stakers.length; i++ ) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];

            if (balance > 0){
            // 1:1 mDAI:Dapp conversion 
            dappToken.transfer(recipient, balance);
            }
            
        }
    }

    // unstaking (withdraw) tokens
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "balance must be > 0 to be able to withdraw");

        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        isStaking[msg.sender] = false;
    }

}