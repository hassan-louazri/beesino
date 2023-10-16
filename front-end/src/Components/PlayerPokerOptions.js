import { useEffect, useState } from "react";

function RaiseButton(props) {
    const handleChange = (event) => { 
        props.setRaisedBet(parseInt(event.target.value) > props.ownStatus.totalBet
            ? parseInt(props.ownStatus.totalBet)
            : parseInt(event.target.value))
    }
    const handleSubmit = (event) => {
        event.preventDefault();

        props.endTurn(props.raisedBet + props.gameInfo.currentAmount, {currentAmount: props.gameInfo.currentAmount + props.raisedBet,
            totalAmount: props.gameInfo.totalAmount + props.raisedBet},
            {raisedTurn: true, initialTurn: props.ownStatus.turn});

        props.setRaising(false);
    }
    const showRaise = () => {
        props.setRaising(!props.raising);
    }

    const maxRaise = () => {
        const diff = props.ownStatus.totalBet - props.gameInfo.currentAmount
        return (diff >= 0 ? diff : props.ownStatus.totalBet).toString()
    } 

    return (
        <div>

            { props.raising
                ?
                <div className="inputRaiseContainer">
                    <input className="inputRaise" placeholder={"Your bet"}
                        type="number" min="0" max={maxRaise} value={props.raisedBet}
                        onChange={handleChange} />
                    <button type="button" className="btn btn-light btn-lg buttonShadow mx-2" onClick={handleSubmit}> Bet </button>
                    <button type="button" className="btn btn-light btn-lg buttonShadow mx-2" onClick={showRaise}> Cancel Bet </button>

                </div>
                : <button className="btn btn-light btn-lg buttonShadow m-2" onClick={showRaise}> Raise </button>
            }
        </div>)
}


function PlayerPokerOptions(props) {

    const socket = props.socket;
    const playersStatus = props.playersStatus;
    const clientID = props.clientID;
    const [ownStatus, setOwnStatus] = useState(playersStatus.find(el => el.id === clientID));
    const tableName = props.tableName;
    const statePoker = props.statePoker;
    const gameInfo = props.gameInfo;
    const setGameInfo = props.setGameInfo;
    const setPlayersStatus = props.setPlayersStatus;
    const [raising, setRaising] = useState(false);
    const [raisedBet, setRaisedBet] = useState(0);
    const [canCheck, setCanCheck] = useState(gameInfo.currentAmount === ownStatus.bet);
    const [canRaise, setCanRaise] = useState(gameInfo.currentAmount - ownStatus.bet < ownStatus.totalBet);
    
    // {currentPlayer: 0, currentTurnType: "Turn", currentAmount: 0, totalAmount: smallBlindValue + bigBlindValue}

    useEffect(() => {
        setOwnStatus(playersStatus.find(el => el.id === clientID));
    }, [playersStatus])

    useEffect(() => {
        setCanCheck(gameInfo.currentAmount === ownStatus.bet)
    }, [props.currentTurn, gameInfo.currentAmount, ownStatus.bet])

    useEffect(() => {
        setCanRaise(gameInfo.currentAmount - ownStatus.bet < ownStatus.totalBet)
    }, [props.currentTurn, gameInfo.currentAmount, ownStatus.totalBet, ownStatus.bet])

    const endTurn = (diffAmount, _gameInfo, options) => {
        socket.emit("endTurnPoker", tableName, ownStatus.turn, statePoker, _gameInfo , diffAmount === null
            ? 0
            : diffAmount, options);
    }

    const check = () => {
        endTurn(null, gameInfo, gameInfo.options)
    }

    const call = () => {
        const diffAmount = gameInfo.currentAmount - ownStatus.bet;
        if (ownStatus.totalBet < diffAmount) {
            endTurn(ownStatus.totalBet, {...gameInfo, totalAmount: gameInfo.totalAmount + ownStatus.totalBet}, gameInfo.options);
        } else {
            endTurn(diffAmount, {...gameInfo, totalAmount:gameInfo.totalAmount + diffAmount}, gameInfo.options);
        }
    }

    const fold = () => {
        socket.emit("foldPoker", tableName, gameInfo);
        endTurn(null, gameInfo, gameInfo.options);
    }


    return (
        <div className="poker buttonOptionsPoker" >
            {props.currentTurn && <div>
                {canCheck && <button className="btn btn-light btn-lg buttonShadow mx-2"
                    onClick={check} disabled={!canCheck}>
                    Check </button>}
                {!canCheck && <button className="btn btn-light btn-lg buttonShadow mx-2"
                    onClick={call}>
                    Call </button>}
                <button className="btn btn-light btn-lg buttonShadow mx-2"
                    onClick={fold}>
                    Fold </button>
                {canRaise && <RaiseButton raising={raising} setRaising={setRaising} raisedBet={raisedBet} setRaisedBet={setRaisedBet}
                    gameInfo={gameInfo} setGameInfo={setGameInfo} endTurn={endTurn} ownStatus={ownStatus}
                    setPlayersStatus={setPlayersStatus} playersStatus={playersStatus}/>}
            </div>}

            {!props.currentTurn && <div className="btn btn-light btn-lg buttonWait buttonShadow mx-2">
                Wait for your turn</div>}

        </div>
    )

}


export default PlayerPokerOptions;