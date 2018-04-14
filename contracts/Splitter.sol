pragma solidity ^0.4.18;

// import "./ConvertLib.sol";

contract Splitter {
    mapping (address => uint256) public balances;
	address public alice;
	bool alreadyPaid;

	event LogSplit(address indexed _accountA, address indexed _accountB, uint256 indexed _value);
    event LogWithdrawal(address indexed _account, uint256 indexed _value);

	function Splitter() 
		public 
	{
		alice = msg.sender;
	}

	function split(address _bob, address _carol) 
		public 
		payable 
		returns (bool success)
	{
		require(msg.sender == alice);
		require(msg.value > 0);
		require((msg.value%2) == 0);
		
		uint256 halfAmount = msg.value/2;
		
        balances[_bob] += halfAmount;
        assert(balances[_bob] >= halfAmount);
        
        balances[_carol] += halfAmount;
        assert(balances[_carol] >= halfAmount);
        
        LogSplit(_bob, _carol, halfAmount);
        
		return true;
	}
	
	function withdrawal()
	    public
	{
	    uint256 withdrawalAmount = balances[msg.sender];
	    require(withdrawalAmount > 0);
	    balances[msg.sender] = 0;
	    LogWithdrawal(msg.sender, withdrawalAmount);
	    msg.sender.transfer(withdrawalAmount);
	}
	    
    function () public {
        revert();
    }

}
