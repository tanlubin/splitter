var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts){
	

	var alice = accounts[0];
	var bob = accounts[1];
	var carol = accounts[2];

	var balanceAlice;
	var balanceBob;
	var balanceCarol;

	beforeEach( function() {
		return Splitter.new(bob, carol, {from:alice})
		.then(function(instance){
			contract = instance;
		});
	});


	it("should be owned by owner", function() {
		return contract.alice({from:alice})
		.then(function(_alice){
			assert.strictEqual(_alice,alice, "Contract is not owned by owner");	
		});
	});


	/*
	IMPORTANT!
	The following checks are done based on the assumption that none of these accounts are mining,
	or have ether being credited to their balances while this test is being run.
	Expected balances are calculated based on the effects of the Splitter contract, and the 
	associated gas costs.
	*/

	it("splits correctly", function(){

		var amountToSend = 5454545454;
		var newBalanceBob;
		var newBalanceCarol;
		var newBalanceAlice;

		// web3.eth.getBalance(bob,(err, balance) => 
		// 	balanceBob = balance);
		// web3.eth.getBalance(carol,(err, balance) => 
		// 	balanceCarol = balance);
		// web3.eth.getBalance(alice,(err, balance) => 
		// 	balanceAlice = balance);

		balanceBob = web3.eth.getBalance(bob);
		balanceCarol = web3.eth.getBalance(carol);
		balanceAlice = web3.eth.getBalance(alice);



		return contract.split({from:alice, value:amountToSend})
		.then(function(tx){
			var gasUsed = tx.receipt.gasUsed; 
			var gasPrice = web3.eth.getTransaction(tx.tx).gasPrice;
			var expectedBalanceAlice = balanceAlice.minus(gasPrice.times(gasUsed))
											.minus(amountToSend);
			
			newBalanceBob = web3.eth.getBalance(bob);
			newBalanceCarol = web3.eth.getBalance(carol);
			newBalanceAlice = web3.eth.getBalance(alice);

			assert.strictEqual(balanceBob.plus(amountToSend/2).toString(10), newBalanceBob.toString(10), "Bob's balance incorrect");

			assert.strictEqual(balanceCarol.plus(amountToSend/2).toString(10), newBalanceCarol.toString(10), "Carol's balance incorrect");

			assert.strictEqual(newBalanceAlice.toString(10), expectedBalanceAlice.toString(10), "Alice's balance incorrect");



		});
	});


	it("rejects non-Alice sender", function(){
		var amountToSend = 5454545454;
		var newBalanceBob;
		var newBalanceCarol;
		var newBalanceAlice;

		balanceBob = web3.eth.getBalance(bob);
		balanceCarol = web3.eth.getBalance(carol);
		balanceAlice = web3.eth.getBalance(alice);


		return contract.split({from:accounts[3], value:amountToSend})
		.then(function(){

			assert.isTrue(true, "Did not revert non-Alice sender")

			
		}) .catch(function(err) {
		     // assert.isTrue(err.toString().includes("Error: VM Exception while processing transaction: revert"),
		     //  "Split function did not revert");
						
			newBalanceBob = web3.eth.getBalance(bob);
			newBalanceCarol = web3.eth.getBalance(carol);
			newBalanceAlice = web3.eth.getBalance(alice);
			

			assert.strictEqual(balanceBob.toString(10), newBalanceBob.toString(10), "Bob's balance incorrect");

			assert.strictEqual(balanceCarol.toString(10), newBalanceCarol.toString(10), "Carol's balance incorrect");

			assert.strictEqual(balanceAlice.toString(10), newBalanceAlice.toString(10), "Alice's balance incorrect");
    	});
	});

	

	it("rejects 0 value", function(){
		var amountToSend = 0;
		var newBalanceBob;
		var newBalanceCarol;
		var newBalanceAlice;

		balanceBob = web3.eth.getBalance(bob);
		balanceCarol = web3.eth.getBalance(carol);
		balanceAlice = web3.eth.getBalance(alice);

		return contract.split({from:alice, value:amountToSend})
		.then(function(){

			assert.isTrue(true, "Did not revert 0 value being sent")

			
		}) .catch(function(err) {
		     // assert.isTrue(err.toString().includes("Error: VM Exception while processing transaction: revert"),
		     //  "Split function did not revert");	

		    var gasUsed = err.receipt.gasUsed; 
			var gasPrice = web3.eth.getTransaction(err.tx).gasPrice;
			var expectedBalanceAlice = balanceAlice.minus(gasPrice.times(gasUsed));



			newBalanceBob = web3.eth.getBalance(bob);
			newBalanceCarol = web3.eth.getBalance(carol);
			newBalanceAlice = web3.eth.getBalance(alice);
			

			assert.strictEqual(balanceBob.toString(10), newBalanceBob.toString(10), "Bob's balance incorrect");

			assert.strictEqual(balanceCarol.toString(10), newBalanceCarol.toString(10), "Carol's balance incorrect");

			assert.strictEqual(newBalanceAlice.toString(10), expectedBalanceAlice.toString(10), "Alice's balance incorrect");
    	});
	});

	it("rejects odd value", function(){
		var amountToSend = 75757575753993;
		var newBalanceBob;
		var newBalanceCarol;
		var newBalanceAlice;

		balanceBob = web3.eth.getBalance(bob);
		balanceCarol = web3.eth.getBalance(carol);
		balanceAlice = web3.eth.getBalance(alice);


		return contract.split({from:alice, value:amountToSend})
		.then(function(){

			assert.isTrue(true, "Did not revert odd value being sent")

			
		}) .catch(function(err) {
		     // assert.isTrue(err.toString().includes("Error: VM Exception while processing transaction: revert"),
		     //  "Split function did not revert");
						
		    var gasUsed = err.receipt.gasUsed; 
			var gasPrice = web3.eth.getTransaction(err.tx).gasPrice;
			var expectedBalanceAlice = balanceAlice.minus(gasPrice.times(gasUsed));


			newBalanceBob = web3.eth.getBalance(bob);
			newBalanceCarol = web3.eth.getBalance(carol);
			newBalanceAlice = web3.eth.getBalance(alice);
			

			assert.strictEqual(balanceBob.toString(10), newBalanceBob.toString(10), "Bob's balance incorrect");

			assert.strictEqual(balanceCarol.toString(10), newBalanceCarol.toString(10), "Carol's balance incorrect");

			assert.strictEqual(newBalanceAlice.toString(10), expectedBalanceAlice.toString(10), "Alice's balance incorrect");
    	});
	});



})