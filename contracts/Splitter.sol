pragma solidity ^0.4.18;

// import "./ConvertLib.sol";

contract Splitter {
	address public alice;
	address public bob;
	address public carol;
	bool alreadyPaid;

	
	event SplitEvent(address _from, address _to, uint256 _value);

	function Splitter(address _bob, address _carol ) 
		public 
	{
		alice = msg.sender;
		bob = _bob;
		carol = _carol;

// 		alreadyPaid = false;
	}

	function split() 
		public 
		payable 
		returns (bool success)
	{
		if ((msg.sender !=  alice) ||
				(msg.value <= 0) || 
				((msg.value%2) != 0))  {
			revert();
		}
		
		uint256 halfAmount = msg.value/2;
        
        //Make payment here.
        give(bob, halfAmount);
        
        give(carol, halfAmount);
        // SplitEvent(alice,carol,halfAmount);
        
		return true;
	}
	
	function give(address recipient, uint256 amount)
	    private
	{
	    if (!alreadyPaid){
	        alreadyPaid = true;
	        recipient.transfer(amount);
	        alreadyPaid = false;
	        SplitEvent(alice,recipient,amount);
	    }
	}
	    

	function getContractBalance()
		view
		public
		returns (uint256){
			return address(this).balance;
		}
    
    function () public {}

}
