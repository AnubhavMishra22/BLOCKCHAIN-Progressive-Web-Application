var express = require('express') //importing express framework to make this server side app
var app = express()
//importing the whole functionality here
var Blockchain = require('./blockchain');
var bitcoin = new Blockchain();

//"app" now represents a server side framework
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//sample get call
app.get('/',function(req,res) {
	res.send('the is one of the node in my Blockchain Network');
});
//created an end point which will give the bitcoin info at a node
app.get('/blockchain',function(req,res) {
	res.send(bitcoin);
});
//transaction end point - used to recieve transaction from external system
app.post('/transaction',function(req,res) {
	console.log(req);
	const newTransaction = req.body;
	var blockIndex = bitcoin.addTransactToPendingTransaction(newTransaction);
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
	Promises.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.'});
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
	res.send('this end point is used to mine the blocks');
});

//to make server listen at 3000
app.listen(3000,function() {
	console.log('listening at the corresponding port 3000');
});