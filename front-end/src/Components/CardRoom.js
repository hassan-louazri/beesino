import {Chip} from "./CasinoComponents";

function CardRoom(props) {

    const joinTable = () => {
        props.socket.emit("joinTable", props.name);
    };

    const gameImg = () => {
        return (
            props.game === "Blackjack"
                ? <div className="salonPokerIcon">
                    <Chip height={40} width={40} color={'red'} style={{cursor: 'auto'}}/>
                </div>
                : <div className="salonPokerIcon">
                    <Chip height={40} width={40} color={'green'} style={{cursor: 'auto'}}/>
                </div>
        )
    }

    return (
        <div className="card bg-secondary cardSelectRoom">
            <div className="card-body">
                {gameImg()}
                <h2 className="card-title py-2"> {props.name.split("_")[0]}</h2>
                <h5> In table : {props.playerCount}/{props.maxPlayer} </h5>
                <h5 className="py-3"> Waiting...</h5>
                <button className="btn buttonShadow py-2"
                        onClick={joinTable} disabled={props.playerCount >= props.maxPlayer}
                        style={{backgroundColor: props.playerCount >= props.maxPlayer ? '#ff0000' : '#fff6bd'}}>
                    {props.playerCount >= props.maxPlayer ? 'Full Table' : 'Join Table'}
                </button>
            </div>
        </div>
    )
}

export default CardRoom;