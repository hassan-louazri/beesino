import {Chip} from "./CasinoComponents";
import {sendToken, getTransactionReceiptMined} from "../scripts/Metamask";
import Tooltip from '@mui/material/Tooltip';


function ChipBlackjack(props) {
    const chipValue = props.chipValue ? props.chipValue  : [50]

    const color = ["white", "blue", "green", "red", "black"]
    const bankAddr = process.env.REACT_APP_BANK_KEY
    const addr = props.addr;
    const multi = props.multi || false;

    const addAmount = (event, card) =>  {
        props.setAmount(props.amount+card.value)
        if (!multi) props.setInitCard(true);
    }

    const Bet = () => {
        //  sendToken(addr, bankAddr, props.amount * (10 ** (-3))).then(async (transactionHash) => {
        //     try{
        //         // waiting for the transaction to be validated
        //         await getTransactionReceiptMined(transactionHash, 500);
        //         (multi) ? props.setBet(true) : props.setPlay(true);
        //     } catch(e) {console.log("error:", e)}
        //         }).catch((e) => console.log(`error sending Token: ${e}`))
        (multi) ? props.setBet(true) : props.setPlay(true);
    } 

    const Reset = () => {
        props.setAmount(0)
    }

    return(
        <div className="container">
            <h4 className="text-color py-5"> {multi && props.bet ? "You have already bet, wait" : "Place your bets, please"} </h4>
            <p>{props.amount}</p>
            <div className="row justify-content-center py-5 ">
                <div className="col col-lg-2 buttonBetReset">
                    <button className="border btn btn-lg btn-secondary" onClick={Bet} disabled={!props.amount || props.bet}>
                        Bet!
                    </button>
                </div>
                <div className="col col-md-auto buttonBetReset">
                    <button className="border btn btn-lg btn-secondary" onClick={Reset}> Reset Amount </button>
                </div>               
            </div>
            <div className={`row justify-content-center chipContainer${multi ? "Multi" : ""}`}>
            {!props.bet && chipValue.map((v, i) =>
                <Tooltip key={i} title={v} placement="top">
                    <div >
                        <Chip value={v} onClick={addAmount} 
                            style={{left: `${i*10}vw`, bottom: '80px', transform: 'translate(-300%)' }} 
                            color={color[i]}
                        />
                    </div>
                </Tooltip>
            )}
            </div>
        </div>
    )
}

export default ChipBlackjack