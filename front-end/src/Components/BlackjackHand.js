import {Hand, HandStyles} from "./CasinoComponents";

function BlackjackHand(props){

    const hand = props.hand;

    return(
        <div>
            <HandStyles/>
            <Hand cards={hand} className={props.className}/>
        </div>
    );
}

export default BlackjackHand;