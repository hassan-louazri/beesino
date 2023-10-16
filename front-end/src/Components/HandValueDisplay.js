import {sumValueCards} from "./CardGame";

function HandValueDisplay(props) {
    const value = sumValueCards(props.cards);
    return (
        <div className="card handValue px-2 py-2 text-light bg-black" style={props.style}>
            {props.text} : {value}
        </div>
    )
}

export default HandValueDisplay;