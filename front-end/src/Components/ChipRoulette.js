import {Chip} from "./CasinoComponents";
import Tooltip from '@mui/material/Tooltip';
import "../Styles/Rouleirb.css"


function ChipRoulette(props) {
    const chipValue = props.chipValue ? props.chipValue  : [50]

    const color = ["white", "blue", "green", "red", "black"]
    const addAmount = (event, card) =>  {
        props.setBet([props.bet[0] + card.value, props.bet[1]]);
        props.setChipColor(card.color);
    }

    return(
        <div className="container col-1 align-self-center">
            <div className="row justify-content-center chipContainerRoulette">
            {chipValue.map((v, i) => 
                <Tooltip key={i} title={v} placement="top">
                    <div >
                        <Chip value={v} onClick={addAmount}
                            style={{position: "relative", top: `${i*20}px`}} 
                            color={color[i]}
                        />
                    </div>
                </Tooltip>
            )}
            </div>
            <div className="betAmountRoulette">
                <h5><span className="badge rounded-pill bg-secondary p-3">
                    Your bet: {(props.betAmount * (10 ** (-3))).toPrecision(3)} ETH
                </span></h5>
            </div>
        </div>
    )
}

export default ChipRoulette