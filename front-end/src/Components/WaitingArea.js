import Chat from "./Chat";
import {useState} from "react";
import ChipBlackjack from "./ChipBlackjack";

function WaitingArea(props) {
    const [isReady, setIsReady] = useState(false);
    const [bet, setBet] = useState(false);
    const socket = props.socket;
    const tableName = props.tableName;
    const setWaiting = props.setWaiting;

    const ready = () => {
        setIsReady(!isReady);
        socket.emit("playerState", tableName);
    }

    const leaveRoom = () => {
        socket.emit("leaveTable", tableName);
        setWaiting(false);
    }

    return (
        <div>
            <h1 className="text-color display-5"> {props.tableName.split("_")[0]} </h1>
            <div className="text-color p-3">
                <h2> {
                    props.nbPlayer >= props.minPlayer
                        ? `${props.nbReady}/${props.nbPlayer} players are ready`
                        : `Waiting for ${props.minPlayer - props.nbPlayer} player...`} </h2>
            </div>

            <Chat socket={props.socket} tableName={tableName} pseudo={props.pseudo} clientID={props.clientID}
                  messageList={props.messageList} setMessageList={props.setMessageList}/>

            <div className="containerPlayer justify-content-center">
                <div className="row row-cols-1">
                    <h4 className="col fst-italic player my-3"> Players Name </h4>
                    {props.playersName?.map((name, i) =>
                        <h5 key={i} className="col player my-3"> {name} </h5>)}
                </div>
            </div>

            <div className="buttonArea">
                <button className="btn buttonWaiting buttonShadow" onClick={    ready}
                        disabled={!bet}
                        style={{backgroundColor: isReady ? '#26ff00' : '#ff0000'}}>
                    {isReady ? "Ready" : "Not Ready"}
                </button>
                <button className="btn btn-light buttonWaiting buttonShadow" onClick={leaveRoom}> Leave</button>
            </div>

            {isReady === false &&
                <div className="betMulti">
                    <ChipBlackjack chipValue={[5, 20, 50]} addr={props.addr} multi={true}
                                        amount={props.amount} setAmount={props.setAmount}
                                        bet={bet} setBet={setBet}/>
                </div>}
        </div>
    )
}

export default WaitingArea;