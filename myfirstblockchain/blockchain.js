var sha256 = require('sha256');

function Blockchain() {
	this.chain = [];
	this.newTransactions = [];
	//assumimg the genesis block

	this.createNewBlock("auvbdvjy367chjdvuyd","sebt17e5364cbchgwq",1332132);
	this.networkNodes = [];
}
//creation and addition of block to chain
Blockchain.prototype.createNewBlock = function(hashOfBlock,previousHash,nonceOfBlock) {
	const newBlock = {
		index:this.chain.length+1,
		timestamp:Date.now(),
		transactions:this.newTransactions,
		hash:hashOfBlock,
		previousBlockHash:previousHash,
		nonce:nonceOfBlock,
	};
	this.chain.push(newBlock);
	this.pendingTransactions=[];
	return newBlock;
}

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
}

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
//this line is used to export the file to any other file which requires it
module.exports = Blockchain;