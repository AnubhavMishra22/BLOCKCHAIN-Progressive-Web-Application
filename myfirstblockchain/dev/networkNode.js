var express = require('express') //importing express framework to make this server side app
var app = express()
//importing the whole functionality here
var Blockchain = require('./blockchain');
var bitcoin = new Blockchain();

const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');

//"app" now represents a server side framework
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
const rp = require('request-promise');
//sample get call
var port = process.argv[2];
app.get('/',function(req,res) {
	res.send('the is one of the node in my Blockchain Network'+port);
});
//created an end point which will give the bitcoin info at a node
app.get('/blockchain',function(req,res) {
	res.send(bitcoin);
});
//transaction end point - used to recieve transaction from external system
app.post('/transaction',function(req,res) {
	console.log(req);
	const newTransaction = req.body;
	var blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block $ { blockchain}.`});
});
// broadcasting the transaction when a new transaction enters the network
app.post('/transaction/broadcast',function(req,res) {
	//implement broadcast using loop
	const newTransaction = bitcoin.createNewTransaction(req.body.sender,req.body.recipient,req.body.amount);
	bitcoin.addTransactToPendingTransaction(newTransaction);
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri : networkNodesUrl +'/transaction',
			method:'POST',
			body: newTransaction,
			json: true
		};
		requestPromises.push(rp(requestOptions));
	});
	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.'});
	});
});

//register node and broadcast in the network 
app.post('/register-and-broadcast-node', function(req,res){
	const newNodeUrl = req.body.newNodeUrl;
	console.log(newNodeUrl);
	console.log(bitcoin.networkNodes);
//http://localhost:3001/register-and-broadcast-node - bitcoin.newNodes
	if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);//add 3010 at 3001
	//repeat the register node endpoint for all the nodes
	const regNodesPromises = [];
	    bitcoin.networkNodes.forEach(networkNodeUrl => {
	const requestOptions = {
		uri: networkNodeUrl + '/register-node', //http://3002/
		method: 'POST',
		body: { newNodeUrl: newNodeUrl },
		json: true
	};

	regNodesPromises.push(rp(requestOptions));
	});
	Promise.all(regNodesPromises)
	.then(data => {
	const bulkRegisterOptions = {
		uri: newNodeUrl + '/register-nodes-bulk',
		method: 'POST',
		body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
		json: true
	};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
});
});

//register node 
app.post('/register-node', function(req,res){
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) {bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });}
	else{
		res.json({ note: 'New node NOT registered.' });
	}
});
//bulk nodes registry
// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	console.log(allNetworkNodes);
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});

//end point to mine the blocks
app.get('/mine',function(req,res) {
	//creating the blocks
	const lastBlock = bitcoin.getLastBlock();
	const previousblockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index']+1
	};
	const nonce= bitcoin.proofOfWork(previousblockHash, currentBlockData);
	const blockHash =  bitcoin.hashBlock(previousblockHash, currentBlockData, nonce);
	const newBlock = bitcoin.createNewBlock(nonce, previousblockHash, blockHashoc);
	//untill this part, a new block is created and then added to the chain at this mode only.
	//you need to broadcast the newly created block
	//1.post the block information   2. post  request must be created   3.internal post call to each node iteratively
	//broadcast the new block to 3002
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
	const requestOptions = {
	uri: networkNodeUrl + '/receive-new-block',
	method: 'POST',
	body: { newBlock: newBlock },
	json: true
	};

	requestPromises.push(rp(requestOptions));
	});
	Promise.all(requestPromises)
	.then(data => {
	const requestOptions = {
	uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
	method: 'POST',
	body: {
	amount: 12.5,
	sender: "00",
	recipient: nodeAddress
	},
	json: true
	};

	return rp(requestOptions);
	})
	.then(data => {
	res.json({
	note: "New block mined & broadcast successfully",
	block: newBlock
	});
	});
		//res.send('this end point is used to mine the blocks');

});

//this will get triggered from /mine and run at every node
app.post('/receive-new-block', function(req,res){
		const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock(); //3002
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	if (correctHash && correctIndex) {
	bitcoin.chain.push(newBlock);//push the new block to the chain which is at 3002
	bitcoin.pendingTransactions = [];
	res.json({
		note: 'New block received and accepted.',
		newBlock: newBlock
	});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}

});

//------------------SERVER ADDRESS HERE--------------------


// consensus protocol - implementation
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;
		console.log('1');
		console.log(blockchains);
		blockchains.forEach(blockchain => {
			console.log('2');
			if (blockchain.chain.length > maxChainLength) {
				console.log('3');
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});
//---------------------Information Retrieval-----------------

//Get the block with hash code

app.get('/block/:blockhash',function(req,res){
	//get the param : blockhash
	//search with in the chain
	//give back the block info as response
	const blockHash = req.params.blockHash;
	console.log("1");
	console.log(blockHash);
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json({
	   block: correctBlock
   });
});

//Get the block with transaction id

app.get('/block/:transactionId',function(req,res){
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
});
//Get the information of a user based on the address

app.get('/block/:address',function(req,res){
	const address = req.param.address;
	const adressData = bitcoin.getAddressData(Address);
	res.json({
		addressData: addressData
	});

});
//to connect ui html file
app.get('/bitcoin-explorer',function(req,res){
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});
//----------------SERVER ADDRESS HERE-------------------------------
app.listen(port,function() {
	console.log('listening at the corresponding port 3001 :- '+port);
});