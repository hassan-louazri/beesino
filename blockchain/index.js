#! /usr/local/bin/node

// Transfers between L1 and L2 using the Optimism SDK

const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")
require('dotenv').config()
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")

const mnemonic = process.env.MNEMONIC
const bank_key = process.env.BANK_KEY
const bank_private_key = process.env.BANK_PRIVATE_KEY
const l1Url = `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_KEY}`
const l2Url = `https://opt-goerli.g.alchemy.com/v2/${process.env.OPTIMISM_GOERLI_ALCHEMY_KEY}`

const web3L2 = createAlchemyWeb3(l2Url)
const web3L1 = createAlchemyWeb3(l1Url)


// Global variable because we need them almost everywhere
let crossChainMessenger
let addr    // Our address

const getSigners = async () => {
    
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

    return [l1Wallet, l2Wallet]
}   // getSigners


const setup = async() => {
  const [l1Signer, l2Signer] = await getSigners()
  addr = l1Signer.address
  crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 5,    // Goerli value, 1 for mainnet
      l2ChainId: 420,  // Goerli value, 10 for mainnet
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer
  })
}    // setup



const gwei = BigInt(1e9)
const eth = gwei * gwei   // 10^18
const centieth = eth/100n


const reportBalances = async () => {
  const l1Balance = (await crossChainMessenger.l1Signer.getBalance()).toString().slice(0,-9)
  const l2Balance = (await crossChainMessenger.l2Signer.getBalance()).toString().slice(0,-9)

  console.log(`On L1:${l1Balance} Gwei    On L2:${l2Balance} Gwei`)
}    // reportBalances


const depositETH = async (amount) => {

  console.log("Deposit ETH")
  await reportBalances()
  const start = new Date()

  const response = await crossChainMessenger.depositETH(amount.toString())
  console.log(`Transaction hash (on L1): ${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                  optimismSDK.MessageStatus.RELAYED)

  await reportBalances()
  console.log(`depositETH took ${(new Date()-start)/1000} seconds\n\n`)
}     // depositETH()





const withdrawETH = async () => { 
  
  console.log("Withdraw ETH")
  const start = new Date()  
  await reportBalances()

  const response = await crossChainMessenger.withdrawETH(centieth)
  console.log(`Transaction hash (on L2): ${response.hash}`)
  await response.wait()

  console.log("Waiting for status to change to IN_CHALLENGE_PERIOD")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response.hash, 
    optimismSDK.MessageStatus.IN_CHALLENGE_PERIOD)
  console.log("In the challenge period, waiting for status READY_FOR_RELAY") 
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response.hash, 
                                                optimismSDK.MessageStatus.READY_FOR_RELAY) 
  console.log("Ready for relay, finalizing message now")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.finalizeMessage(response)
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response, 
    optimismSDK.MessageStatus.RELAYED)
  await reportBalances()   
  console.log(`withdrawETH took ${(new Date()-start)/1000} seconds\n\n\n`)  
}     // withdrawETH()


async function sendL2toL2(_to, amount) {
    const nonce = await web3L2.eth.getTransactionCount(bank_key, 'latest'); //get latest nonce
  
  //the transaction
    const tx = {
      'from': bank_key,
      'to': _to,
      'nonce': nonce,   
      'gas': 500000,
      'value': amount.toString(),
    };
  
    const signPromise = web3L2.eth.accounts.signTransaction(tx, bank_private_key)
    signPromise.then((signedTx) => {
        web3L2.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
            if (!err) {
              console.log("The hash of your transaction is: ", hash)
            } else {
              console.log("Something went wrong when submitting your transaction:", err)
            }
          }
        )
      })
      .catch((err) => {
        console.log(" Promise failed:", err)
      })
  }

async function sendL1toL1(_to, amount) {
    const nonce = await web3L1.eth.getTransactionCount(bank_key, 'latest'); //get latest nonce
  
    const tx = {
      'from': bank_key,
      'to': _to,
      'nonce': nonce,   
      'gas': 500000,
      'value': amount.toString(),
    };
  
    const signPromise = web3L1.eth.accounts.signTransaction(tx, bank_private_key)
    signPromise.then((signedTx) => {
        web3L1.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
            if (!err) {
              console.log("The hash of your transaction is: ", hash)
            } else {
              console.log("Something went wrong when submitting your transaction:", err)
            }
          }
        )
      })
      .catch((err) => {
        console.log(" Promise failed:", err)
      })
  }


const deposit = async (addr, amount) => {
    await setup()
    await depositETH(amount)
    await sendL2toL2(addr , amount)
}
const withdraw = async (addr, amount) => {
    await setup()
    await withdrawETH(amount)
    await sendL1toL1(addr, amount)
}


module.exports = {deposit, withdraw}





