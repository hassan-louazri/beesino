import "../Styles/Rouleirb.css";
import {Chip} from "./CasinoComponents";

function CaseNumber(props) {
    let classNameColor = props.number % 2 ? "caseNumber".concat(" caseNumberOdd")
        : "caseNumber".concat(" caseNumberEven");
    return(
        <div className={classNameColor}
            onClick={() => {props.bet(props.number.toString())}}>
            {props.number}
            {props.betChip}
        </div>
    )
}


function RouleirbPlateau(props) {

    const topOptions = ["1-12", "13-24", "25-36"];
    const bottomOptions = ["1-18","Even", "Red", "Black", "Odd", "19-36"];

    const bet = (value) => {
        props.setBet([props.bet[0], value]);
    }

    const betChip = (value) => {
        let caseNumber = props.allBet.find((el) => el.number === value.toString());
        return caseNumber && <Chip height={25} width={25} color={caseNumber.color} />
    }

    return(
        <div className="col-12 row plateauContainer align-self-center">

            <div className="case0" onClick={() => bet("0")}>
                0
                {betChip(0)}
            </div>

            {/* top betting options */}
            <div className="row topRow">
                {topOptions.map((options, key) => {return (
                    <div key={key} className="col py-4 rouletteOptions rouletteOptionsTop"
                         onClick={() => bet(options)}
                    >
                        {options}
                        {betChip(options)}
                    </div>
                )})}
            </div>

            <div className="mainSection">
                <ul>
                    {[...Array(36)].map((val,idx) => {
                        return <li key={idx}>
                            <CaseNumber number={idx + 1} bet={bet} betChip={betChip(idx+1)}/>
                        </li>
                    })}
                </ul>
            </div>

            {/* bottom betting options */}
            <div className="row bottomRow">
                {bottomOptions.map((options, key) => {return (
                    <div key={key} className={"col py-4 rouletteOptions rouletteOptionsBottom ".concat(options === "Red" ? "rouletteOptionsColor".concat(options)
                                                                                : options === "Black" ? "rouletteOptionsColor".concat(options)
                                                                                : " "
                        )}
                         onClick={() => bet(options)}
                    >
                        {options}
                        {betChip(options)}
                    </div>
                    )})}
            </div>
        </div>
    )
}

export default RouleirbPlateau