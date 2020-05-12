const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v5');

function Blockchain() {
	this.chain = [];
	this.newTransactions = [];
	//assumimg the genesis block

	this.createNewBlock("auvbdvjy367chjdvuyd","sebt17e5364cbchgwq",1332132);
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];
};
//creation and addition of block to chain
// Blockchain.prototype.createNewBlock = function(hashOfBlock,previousHash,nonceOfBlock) {
// 	const newBlock = {
// 		index:this.chain.length+1,
// 		timestamp:Date.now(),
// 		transactions:this.newTransactions,
// 		hash:hashOfBlock,
// 		previousBlockHash:previousHash,
// 		nonce:nonceOfBlock,
// 	};
// 	this.chain.push(newBlock);
// 	this.pendingTransactions=[];
// 	return newBlock;
// }

//creation and addition of the block to the chain
Blockchain.prototype.createNewBlock = function(hashOfBlock,previousHash,nonceOfBlock){
    const newBlock = {
        index:this.chain.length+1,
        timestamp:Date.now(),
        transactions:this.pendingTransactions,
        hash:hashOfBlock,
        previousBlockHash:previousHash,
        nonce:nonceOfBlock
    };
    this.chain.push(newBlock);
    this.pendingTransactions=[];
    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
return this.chain[this.chain.length - 1]; 	
};

//create mechanism to create and add new transaction
Blockchain.prototype.createNewTransaction = function(sender,recipient,amount) {
	const newTransaction = {
		sender:sender,
		recipient:recipient,
		amount:amount,
	};
	this.newTransactions.push(newTransaction);
	return newTransaction;
}

//create mechanism add new transactions to pending transactions
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()['index'] + 1; //return the idex value of the block to which this tr wil get added
};

//to get the last block info
Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

//hash
  Blockchain.prototype.hashBlock = function(previousBlockHash,nonce,currentBlockData) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData) {
	let nonce=0;
	var hash = this.hashBlock(previousBlockHash,nonce,currentBlockData);
	//framing algo for math problem
	while(hash.substring(0,4)!=="0000") {
		nonce++;
		var hash =this.hashBlock(previousBlockHash,nonce,currentBlockData);
	}
	return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;
	
	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};

//this func is used to retrieve the block info with hash value
Blockchain.prototype.getBlock = function(blockHash){
	let correctBlock = null;
	this.chain.forEach(block => {
	//in this interation - block value changes
	if (block.hash === blockHash){
	 correctBlock = block;
	 console.log("2");
	 console.log(block.hash);
	};
	return correctBlock;
});
};

//this function is used to retrieve the transaction data
Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
	block.transactions.forEach(transaction => {
	if (transaction.transactionId === transactionId) {
	correctTransaction = transaction;
	correctBlock = block;
	};
});
});

	return {
	transaction: correctTransaction,
	block: correctBlock
	};
};

Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
	block.transactions.forEach(transaction => {
	if(transaction.sender === address || transaction.recipient === address) 
	{
	addressTransactions.push(transaction);
	};
	});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
	if (transaction.recipient === address) balance += transaction.amount;
	else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};


//this line is used to export the file to any other file which requires it
module.exports = Blockchain;