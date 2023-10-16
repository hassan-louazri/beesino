import React, {useState} from 'react'
import {Wheel} from 'react-custom-roulette'
import "../Styles/Rouleirb.css"

import {sendToken, getTransactionReceiptMined} from "../scripts/Metamask";

// const findColorResult = (prizeNumber) => {
//   return data[prizeNumber].style.backgroundColor
// }

// const findValue = (prizeNumber) => {
//   return data[prizeNumber].option
// }


const data = [];
data.push({option: 0, style: {backgroundColor: 'green'}});

[...Array(36).keys()].forEach((index) =>
    data.push({option: index+1, style: {backgroundColor: (index+1) % 2 === 0 ? 'black' : 'red'}}));

 const Roulette = (props) => {

  const [mustSpin, setMustSpin] = useState(false);
  // const [colorResult, setcolorResult] = useState("");
  // const [numberResult, setNumberResult] = useState(0);
  const [historyNumbers, setHistoryNumbers] = useState([]);
  const bankAddr = process.env.REACT_APP_BANK_KEY

  const handleSpinClick = () => {

    const newPrizeNumber = Math.floor(Math.random() * data.length);
    props.setPrizeNumber(newPrizeNumber);
    // const newColorResult = findColorResult(props.prizeNumber);
    // setcolorResult(newColorResult);
    // const newNumerResult = findValue(props.prizeNumber);
    // setNumberResult(newNumerResult);
    
    const amount = props.allBet.reduce((partial, a) => partial + a.amount, 0);
    sendToken(props.addr, bankAddr, amount * (10 ** (-3))).then(async (transactionHash) => {
      try{
        // waiting for the transaction to be validated
        await getTransactionReceiptMined(transactionHash, 500);
        setMustSpin(true)
      } catch(e) {console.log("error:", e)}
    }).catch((e) => console.log(`error sending Token: ${e}`))

  }

  const onStopSpinning = () => {
    setMustSpin(false);

    const currentTwenty = [props.prizeNumber, ...historyNumbers];
    if (currentTwenty.length > 20){
      currentTwenty.pop();
    }
    setHistoryNumbers(currentTwenty);
    props.winOrLose();
    props.reset();
}

    return (
        <div className="col wheelComponent">
            <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={props.prizeNumber}
                data={data}
                outerBorderColor={"black"}
                outerBorderWidth={15}
                innerBorderColor={"black"}
                radiusLineColor={"#ffe6a7"}
                radiusLineWidth={2}
                textColors={["#ffffff"]}
                textDistance={85}
                fontSize={17}
                perpendicularText={true}
                innerRadius={40}
                innerBorderWidth={30}

                onStopSpinning={() => {
                    onStopSpinning()
                }}
            />

            <button onClick={handleSpinClick} className="btn btn-light btn-lg spin-button"
                    disabled={(props.allBet.length === 0)}>
                SPIN
            </button>

            <div className="history">
                <h3 className="fw-light fst-italic historyTitle"> Last 20 numbers: </h3>
                <div className="historyNumbers rounded-2">
                    {historyNumbers.map((value) =>
                        <div className={"badge mx-1 p-2 ".concat(
                            value === 0 ? "bg-success" : value % 2 === 0 ? "caseNumberEven" : "caseNumberOdd")}
                        >
                            {value}
                        </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Roulette;