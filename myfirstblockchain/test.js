var Blockchain = require('./blockchain');
var bitcoin = new Blockchain();
//calling craete blockfunction
var newBlock = bitcoin.createNewBlock('as2134safdafca3r32','42asddac34rqffqaa',234234);
// var newBlock = bitcoin.createNewBlock('as2134safdafca3r32','42asddac34rqffqaa',234234);
// var newBlock = bitcoin.createNewBlock('as2134safdafca3r32','42asddac34rqffqaa',234234);
// var newBlock = bitcoin.createNewBlock('as2134safdafca3r32','42asddac34rqffqaa',234234);
// var newBlock = bitcoin.createNewBlock('as2134safdafca3r32','42asddac34rqffqaa',234234);
//code to create/generate transaction by calling function
//var newTransaction = bitcoin.createNewTransaction('revanth','ravi',4567);
// var newTransaction = bitcoin.createNewTransaction('revanth','ravi',4567);
// var newTransaction = bitcoin.createNewTransaction('revanth','ravi',4567);
// var newTransaction = bitcoin.createNewTransaction('revanth','ravi',4567);
// var newTransaction = bitcoin.createNewTransaction('revanth','ravi',4567);
var currentBlockData = {
	"sender":"revanth",
	"recipient":"kumar",
	"amount":67890
};
//var hash = bitcoin.hashBlock("as2134safdafca3r32",3234,currentBlockData);
var nonce = bitcoin.proofOfWork("as2134safdafca3r32",currentBlockData);
//printing value of new block which is created
//console.log(newTransaction);
//console.log(bitcoin);
//console.log(hash);
console.log(nonce);