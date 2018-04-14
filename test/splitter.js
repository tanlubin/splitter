var Splitter = artifacts.require("./Splitter.sol");
const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");

contract('Splitter', function(accounts){
	

	const alice = accounts[0];
	const bob = accounts[1];
	const carol = accounts[2];

	beforeEach( function() {
		return Splitter.new({from:alice})
		.then(function(instance){
			splitterContract = instance;
		});
	});


	// it("should be owned by owner", function() {
	// 	return splitterContract.alice()
	// 	.then(function(_alice){
	// 		assert.strictEqual(_alice,alice, "Contract is not owned by owner");	
	// 	});
	// });


	/*
	IMPORTANT!
	The following checks are done based on the assumption that none of these accounts are mining,
	or have ether being credited to their balances while this test is being run.
	Expected balances are calculated based on the effects of the Splitter contract, and the 
	associated gas costs.
	*/

	it("splits correctly", function(){

		var amountToSend = web3.toBigNumber(5454545454);
		var halfAmount = amountToSend.div(2);
		var newBalanceAlice, newBalanceBob, newBalanceCarol;
		var balanceAlice, balanceBob, balanceCarol;
		var gasUsed, gasPrice, gasCost;
		var expectedBalanceAlice, expectedBalanceBob, expectedBalanceCarol;

		web3.eth.getBalance(bob,(err, balance) => balanceBob = balance);
		web3.eth.getBalance(carol,(err, balance) => balanceCarol = balance);
		web3.eth.getBalance(alice,(err, balance) => balanceAlice = balance);

		return splitterContract.split(bob,carol, {from:alice, value:amountToSend})
		.then(function(tx){
			gasUsed = tx.receipt.gasUsed; 
			web3.eth.getTransaction(tx.tx,(err, txInfo) => {
				gasPrice = txInfo.gasPrice;
				gasCost = gasPrice.times(gasUsed);	
				expectedBalanceAlice = balanceAlice.minus(gasCost).minus(amountToSend);
			});

			web3.eth.getBalance(alice,(err, balance) => {
				newBalanceAlice = balance;	
			});

			return splitterContract.balances.call(bob)
			.then((bobBalance) => {

				assert.strictEqual(bobBalance.toString(10),halfAmount.toString(10),"Bob's contract balance incorrect.");

				return splitterContract.balances.call(carol)
				.then((carolBalance) => {
					assert.strictEqual(carolBalance.toString(10),halfAmount.toString(10),"Carol's contract balance incorrect.");

					return splitterContract.withdrawal({from:bob})
					.then((txBob) => {
						gasUsed = txBob.receipt.gasUsed; 
						web3.eth.getTransaction(txBob.tx,(err, txInfo) => {
						gasPrice = txInfo.gasPrice;
						gasCost = gasPrice.times(gasUsed);	
						expectedBalanceBob = balanceBob.minus(gasCost).plus(halfAmount);
						});

						web3.eth.getBalance(bob,(err, balance) => {
						newBalanceBob = balance;	
						});

						return splitterContract.withdrawal({from:carol})
						.then((txCarol) => {
							gasUsed = txCarol.receipt.gasUsed; 
							
							web3.eth.getTransaction(txCarol.tx,(err, txInfo) => {
							gasPrice = txInfo.gasPrice;
							gasCost = gasPrice.times(gasUsed);	
							expectedBalanceCarol = balanceCarol.minus(gasCost).plus(halfAmount);
							});

							web3.eth.getBalance(carol,(err, balance) => {
							newBalanceCarol = balance;	
							});

							return splitterContract.balances.call(bob)
							.then((bobBalance)=>{
								assert.equal(bobBalance.toString(10),0,"Bob contract balance not 0 after withdrawal.")

								return splitterContract.balances.call(carol)
								.then((carolBalance) => {

									assert.equal(carolBalance.toString(10),0,"Carol contract balance not 0 after withdrawal.")
								});						
							});
						});				
					});
				});	
			});
		}).then(() => {
			assert.strictEqual(newBalanceAlice.toString(10), expectedBalanceAlice.toString(10),
			"Alice balance incorrect.");
			assert.strictEqual(newBalanceBob.toString(10), expectedBalanceBob.toString(10),
							"Bob balance incorrect.");
			assert.strictEqual(newBalanceCarol.toString(10), expectedBalanceCarol.toString(10),
								"Carol balance incorrect.");
			});
	});

	it ("rejects non-Alice sender", function(){
		var amountToSend = web3.toBigNumber(5454545454);

		return expectedExceptionPromise(() =>{
			return splitterContract.split(bob,carol,{from:bob,value:amountToSend})
			});
	});

	it ("rejects 0 value", function(){
		var amountToSend = web3.toBigNumber(0);

		return expectedExceptionPromise(() =>{
			return splitterContract.split(bob,carol,{from:alice,value:amountToSend})
			});
	});

	it ("rejects odd value", function(){
		var amountToSend = web3.toBigNumber(5454545455);

		return expectedExceptionPromise(() =>{
			return splitterContract.split(bob,carol,{from:alice,value:amountToSend})
			});
	});
})