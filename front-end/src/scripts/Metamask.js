import Web3 from "web3";
const web3 = new Web3(window.ethereum);
const web3L1 = new Web3(`https://eth-goerli.g.alchemy.com/v2/${process.env.REACT_APP_GOERLI_ALCHEMY_KEY}`);
const web3L2 = new Web3(`https://opt-goerli.g.alchemy.com/v2/${process.env.REACT_APP_OPTIMISM_GOERLI_ALCHEMY_KEY}`);

const bank_key = process.env.REACT_APP_BANK_KEY
const bank_private_key = process.env.REACT_APP_BANK_PRIVATE_KEY


function getTransactionReceiptMined(txHash, interval) {
    const self = this;
    const transactionReceiptAsync = function(resolve, reject) {
        web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject),
                    interval ? interval : 500);
            } else {
                resolve(receipt);
            }
        });
    };

    if (Array.isArray(txHash)) {
        return Promise.all(txHash.map(
            oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
};

// transaction L1->L2
const handleSubmitSend = (addr, bankAddr, amount) => {
    // event.preventDefault();
    sendToken(addr, bankAddr, amount).then(async (transactionHash) => {
        try{
            await getTransactionReceiptMined(transactionHash, 500);
            const response = await fetch("http://localhost:3001/deposit", {
                            method: "POST",
                            body: JSON.stringify({addr: addr, amount: amount}),
                            headers: {
                                "Content-Type": "application/json"
                            },
                        });
            console.log(response)
        } catch(e) {console.log("error:", e)}
            }).catch((e) => console.log(`error sending Token: ${e}`))
}

// transaction L2->L1
const handleSubmitReceive = (addr, bankAddr, amount) => {
    sendToken(addr[0], bankAddr, amount).then(async (transactionHash) => {
        try{
            await getTransactionReceiptMined(transactionHash, 500);
            const response = await fetch("http://localhost:3001/withdraw", {
                            method: "POST",
                            body: JSON.stringify({addr: addr, amount: amount}),
                            headers: {
                                "Content-Type": "application/json"
                            },
                        });
            console.log(response)
        } catch(e) {console.log("error:", e)}
            }).catch((e) => console.log(`error sending Token: ${e}`))
}

async function sendL2toL2FromBank(_to, amount) {
    const nonce = await web3L2.eth.getTransactionCount(bank_key, 'latest'); //get latest nonce
    const tx = {
      'from': bank_key,
      'to': _to,
      'nonce': nonce,   
      'gas': 500000,
      'value': (amount * (10 ** 15)).toString(),
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

const sendToken = async (addr, bankAddr, amount) => {
    let amountETH = amount * (10 ** 18) // eth divided into 18 decimals
    const transactionParameters = {
        from: addr,
        to: bankAddr,
        value: amountETH.toString(16), // hexa
    };
    // console.log(transactionParameters)
     return window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    })
    .then((result) => {
        console.log("transaction hash: ", result)
        return result
    })
    .catch((e)=>alert("transaction rejected",e))
}

const changeNetwork = async (chain) => {
    let params;
    let paramsAdd;
    if(chain === "goerli"){
        // params for goerli chain on metamask
        params = [{ chainId:  "0x5"}]
        paramsAdd = [
            {
                chainId: '0x5',
                chainName: 'Réseau de test Goerli',
                nativeCurrency: {
                    name: "GoerliETH",
                    symbol: "ETH", // 2-6 characters long
                    decimals: 18,
                },
                rpcUrls: ['https://goerli.infura.io/v3/'],
                blockExplorerUrls: ["https://goerli.etherscan.io"],
            }]
    } else {
        // params for arbitrum goerli (optimistic) chain on metamask
        params = [{ chainId:  "0x1A4"}]
        paramsAdd = [
            {
                chainId: '0x1A4',
                chainName: 'Optimism Goerli',
                nativeCurrency: {
                    name: "GoerliETH",
                    symbol: "ETH", // 2-6 characters long
                    decimals: 18,
                },
                rpcUrls: ['https://goerli.optimism.io'],
                blockExplorerUrls: ["https://goerli-optimism.etherscan.io/"],
            }]
    }
    try {
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: params, // chainId must be in hexadecimal numbers
    });
    } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: paramsAdd,
            });
            } catch (addError) {
            // handle "add" error
            }
        }
    console.error(error);
    }
}

const getAddrFromMetamask = async () => {
    return window.ethereum.request({method:'eth_requestAccounts'})
}
const getL1BalanceFromMetamask = async (addr) => {
    return web3L1.eth.getBalance(addr)
}
const getL2BalanceFromMetamask = async (addr) => {
    return web3L2.eth.getBalance(addr)
}

export {
    handleSubmitSend, handleSubmitReceive, sendToken, changeNetwork, getTransactionReceiptMined, 
    getAddrFromMetamask, getL1BalanceFromMetamask, getL2BalanceFromMetamask, sendL2toL2FromBank
}