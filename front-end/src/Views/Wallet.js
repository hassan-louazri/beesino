import { useState } from "react";
import "../Styles/Common.css"
import "../Styles/Wallet.css"

import {handleSubmitSend, handleSubmitReceive, getAddrFromMetamask} from "../scripts/Metamask"

function WalletPage(){
    return(
        <Deposit/>
    );
}

function Deposit(){

    const [addr, setAddr] = useState(null)
    const [amount, setAmount] = useState(0)
    const bankAddr = process.env.REACT_APP_BANK_KEY

    getAddrFromMetamask().then((addr) => setAddr(addr[0]));

    const handleChange = (event) => {
        setAmount(event.target.value)
    }

    const handleSubmit = (addr, bankAddr, amount) => {
        const sign = amount.charAt(0);


        (sign === "+")
            ? handleSubmitSend(addr, bankAddr, amount.slice(1))
            : (sign === "-")
                ? handleSubmitReceive(addr, bankAddr, amount.slice(1))
                :(alert("error: sign in value"));
    }


    return (
        <div className="main text-color" style={{fontSize: '22px'}}>
            <div className="box p-5">
                <div className="left">
                    <p>The bank's address is:</p>
                    <p>{bankAddr}</p>
                </div>

                <div className="right"> Deposit (+) or withdraw (-) your tokens
                    <label>
                        Value:
                        <input className="inputAmount" type="text" value={amount} onChange={handleChange} />
                        <span>ETH</span>
                    </label>
                    <br/>
                    <input className="btn btn-light btn-lg m-2" type="button" value="Transfer" onClick={() => handleSubmit(addr, bankAddr, amount)} />
                </div>


            </div>
        </div>
      );

}

export default WalletPage;