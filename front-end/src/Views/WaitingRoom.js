/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import "../Styles/Common.css"
import WaitingArea from "../Components/WaitingArea";
import PokerTable from "../Components/PokerTable";
import BlackjackTable from "../Components/BlackjackTable";
import PseudoInput from "../Components/PseudoInput";

function WaitingRoom(props){
    const socket = props.socket;
    const [nbPlayer, setNbPlayer] = useState(0);
    const [playersID, setPlayersID] = useState([]);
    const [playersName, setPlayersName] = useState([]);
    const [nbReady, setNbReady] = useState(0);
    const [play, setPlay] = useState(false);
    const [amount, setAmount] = useState(0);
    const [name, setName] = useState(false);
    const [pseudo, setPseudo] = useState("");
    const [messageList, setMessageList] = useState([]);
    const games = [BlackjackTable, PokerTable];


    useEffect(() => {
        socket.emit("getPlayerIds", props.tableName);
        socket.emit("readyNumber", props.tableName);
        socket.emit("playerNumber", props.tableName);
    }, [])

    useEffect(() => {

        socket.on("new_player",(arg) => {
            setNbPlayer(arg.all_players);
            setPlayersID(arg.playersID);
            setNbReady(arg.readyNumber);
        });

        socket.on("updatePlayerCount", (arg) => {
            setNbPlayer(arg.playerCount);
        });

        socket.on("readyNumber", (arg) => {
            setNbReady(arg.readyNb);
        });

        socket.on("playerNumber", (arg) => {
            setNbPlayer(arg.playerNb);
        })

        socket.on("updatePlayersID", (arg) => {
            setPlayersID(arg.playersID);
        });

        socket.on("updatePlayersName", (arg) => {
            setPlayersName(arg.playersName);
        });

        socket.on("player_ready_announcement", (arg) => {
            setNbReady(arg.total_ready_count);
        });

        return () => {
            socket.off("new_player");
            socket.off("updatePlayerCount");
            socket.off("updatePlayersID");
            socket.off("player_ready_announcement");
            socket.off("updatePlayerName");
            // ne pas off updatePlayerCount pour l'update du nombre de joueur
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(() => {
        allReady();
    },[nbReady, nbPlayer]);

    const allReady = () => {
        if ((nbPlayer >= props.minPlayer) && (nbReady === nbPlayer)) {
            setPlay(true);
        }
    }

    function goGame() {
        const GameComponent = games.find(game => game.name.includes(props.game));

        return (
            <GameComponent addr={props.addr} clientID={props.clientId} players={playersID} socket={socket}
                           tableName={props.tableName} amount={amount} multi={true} setWaiting={props.setWaiting}
                            pseudo={pseudo} messageList={messageList} setMessageList={setMessageList}/>
        );
    }

    return (
        <div className="waitingRoom">
            {(play === false)
                ? (name) ? <WaitingArea socket={props.socket} tableName={props.tableName} game={props.game}
                                        nbPlayer={nbPlayer} playersName={playersName} minPlayer={props.minPlayer}
                                        nbReady={nbReady} amount={amount} setAmount={setAmount} pseudo={pseudo}
                                        messageList={messageList} setMessageList={setMessageList}
                                        setWaiting={props.setWaiting} clientID={props.clientId} addr={props.addr}/>
                    : <PseudoInput socket={props.socket} clientID={props.clientId} tableName={props.tableName}
                                   setName={setName} pseudo={pseudo} setPseudo={setPseudo} setWaiting={props.setWaiting}/>
                : goGame()}
        </div>
    );
}

export default WaitingRoom;