/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "../Styles/Poker.css";
import Board from "./Board";
import PlayerPoker from "./PlayerPoker";
import PlayerPokerOptions from "./PlayerPokerOptions";
import OpponentDisplay from "./OpponentDisplay";
import GameInfo from "./GameInfo";
import ChatPop from "./ChatPop";


const EndPoker = (props) => {
    return (
        <div className={`end opponent-length-${props.nbOpponent}`}>
            <h2 className="winner text-color"> {props.pseudoWin} Win! </h2>
        </div>
    );
};

const PokerTable = (props) => {
    const [initGame, setInitGame] = useState(true);
    const [initBet, setInitBet] = useState(false);
    const [blind, setBlind] = useState(false);
    const [startGame, setStartGame] = useState(false);
    const [board, setBoard] = useState(Array(5).fill(0).map(el => ({suit:'', face:''})));
    const socket = props.socket;
    const tableName = props.tableName;
    const [turn, setTurn] = useState(false);
    const [initTurn, setInitTurn] = useState(false);
    const players = props.players;
    const [opponentIds, setOpponentIds] = useState(players.filter(player => player !== props.clientID));
    const [playersStatus, setPlayersStatus] = useState(players.map(el => ({id: el, hand: [{suit:'', face:''},
            {suit: '', face: ''}], turn: null, bet: 0, totalBet: 0, alive: true})));
    const smallBlindValue = 5;
    const bigBlindValue = 10;
    const [statePoker, setStatePoker] = useState("PreFlop");
    const [currentTurn, setCurrentTurn] = useState(0);
    const [gameInfo, setGameInfo] = useState({
        currentPlayer: 0, currentTurnType: "PreFlop", currentAmount: bigBlindValue,
        totalAmount: smallBlindValue + bigBlindValue,
        initTurn: 0,
        options:{raisedTurn: false, initialTurn: 0}
    });
    const [chatOpen, setChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState(false);
    const [nbBet, setNbBet] = useState(0);
    const [pseudoWin, setPseudoWin] = useState("");

    // flop / turn / river
    // exemple de playerStatus et playersStatus est un array de playerStatus
    const playerStatusExample = {
        id: "dfgfd098UJOKLJ",
        hand: [{suit:'', face:''}, {suit: '', face: ''}],
        turn: 0,
        bet: 5,
        totalBet: 100,
        aclive: true
    }


    useEffect(() => {

        socket.on("initPokerGame", (arg) => {
            if( arg.hand === undefined ) {
                socket.emit("initPokerGame", tableName);
                return
            }
            const hand = arg.hand.hand;
            const order = arg.order;
            if (initGame) {
                setInitGame(false)
                
                _setPlayerHand([hand[0], hand[1]]);
                _setTurnOrder(order);

                setInitTurn(true);
            }
        })

        socket.on("pokerBet", (arg) => {
            _setTotalBet(arg.id, arg.bet);
            setNbBet((nbbet) => nbbet + 1);
        })

        socket.on("newTurnPoker", arg => {
            setPlayersStatus(players => players.map(player => player.id === arg.id
                ? {...player, bet: player.bet + arg.updatedPlayerStatus,
                    totalBet: player.totalBet - arg.updatedPlayerStatus}
                : player));
            if (arg.updatedGameInfo !== null) setGameInfo((gameInfo) => (
                { ...gameInfo, currentAmount: arg.updatedGameInfo.currentAmount,
                    totalAmount: arg.updatedGameInfo.totalAmount,
                    options: arg.updatedGameInfo.options
                }));
            setCurrentTurn(arg.turn)
            if (arg.statePoker !== statePoker){
                setPlayersStatus(players => players.map(player => ({...player, bet: 0})));
                setGameInfo(game => ({...game, currentAmount: 0}));
                setStatePoker(arg.statePoker);
                arg.statePoker === "Flop"
                    ?  setBoard((board) =>
                        [...arg.board, arg.board, {suit: '', face: ''}, {suit: '', face: ''}])
                : arg.statePoker === "Turn"
                        ? setBoard((board) =>
                            [board[0], board[1], board[2], arg.board, {suit: '', face: ''}])

                        : setBoard((board) =>
                            [board[0], board[1], board[2], board[3], arg.board]);
            }
        })

        socket.on("continueTurnPoker", arg => {
            setPlayersStatus(players => players.map(player => player.id === arg.id
                ? {...player, bet: player.bet + arg.updatedPlayerStatus,
                    totalBet: player.totalBet - arg.updatedPlayerStatus}
                : player));
            if (arg.updatedGameInfo !== null) setGameInfo((gameInfo) => (
                { ...gameInfo, currentAmount: arg.updatedGameInfo.currentAmount,
                    totalAmount: arg.updatedGameInfo.totalAmount,
                    options: {raisedTurn: true, initialTurn: arg.starting}
                }));
            setCurrentTurn(arg.NextTurn)
        })

        socket.on("endGamePoker", arg => {
            console.log(arg);
            setStatePoker(arg.statePoker);
            setPseudoWin(arg.winner);
            setPlayersStatus(players => players.map((player, i) => player.id === arg.cards[i].id
                ? {...player, hand: arg.cards[i].hand}
                : player));

        })

        socket.on("endGamePokerFold", arg => {
            console.log(arg);
            setStatePoker(arg.statePoker);
            setPlayersStatus(players => players.map((player, i) => player.id === arg.cards[i].id
                ? {...player, hand: arg.cards[i].hand}
                : player));
            setBoard(board => [...arg.board[0], arg.board[1], arg.board[2]])
        })

        socket.on("foldPoker", arg => {
            console.log(arg)
            setPlayersStatus(players => players.map(player => player.id === arg.id ? {...player, alive: false} : player))
            setGameInfo(game => ({...game, initTurn: arg.gameInfoInitTurn}));
        })

        return () => {
            socket.off("initPokerGame");
            socket.off("pokerBet");
            socket.off("newTurnPoker");
            socket.off("continueTurnPoker");
            socket.off("endGamePoker");
            socket.off("endGamePokerFold");
            socket.off("foldPoker")
        }

    })

    useEffect(() => {
        if (playersStatus.some(el => el.id === props.clientID && el.turn === currentTurn)) setTurn(true) 
        else setTurn(false)
    }, [currentTurn])

    useEffect(() => {
        if (initGame) {
            socket.emit("pokerBet", tableName, props.amount);
        }
    }, [])

    useEffect(() => {
        if (nbBet >= players.length){
            socket.emit("initPokerGame", tableName);
        }
    }, [nbBet])

    useEffect(() => {
        if (initTurn === true) {
            reOrderOppoentsIds();
            if (playersStatus.some(el => el.id === props.clientID && el.turn  === currentTurn)){
                setTurn(true);
            }
            setInitBet(true);
        }
    }, [initTurn])

    useEffect(() => {
        if (initBet === true) {
            _setBlind(smallBlindValue, bigBlindValue);
            /* Transaction ? */
            setBlind(true);
            setInitBet(false);
        }
    }, [initBet]);

    useEffect(() => {
        if(blind){
            setStartGame(true);
        }
    }, [blind])


    const getTurnOrder = (player) => {
        return playersStatus.find(order => order.id === player); 
    }

    const reOrderOppoentsIds = () => {
        const localTurn = getTurnOrder(props.clientID);
        const ids = opponentIds.splice(0, localTurn.turn);
        setOpponentIds((oppIds) => [...opponentIds, ...ids])
    }

    const _setPlayerHand = (hand) => {
        setPlayersStatus((player) => player.map((el) => el.id === props.clientID
            ? {...el, hand: hand}
            : el) )
    }

    const _setTurnOrder = (order) => {
        setPlayersStatus((player) => player.map((el, i) => el.id === order[i].id
            ? {...el, turn: order[i].turn}
            : el) )
    }

    const _getPlayerFromTurnOrder = (turn) => {
        return playersStatus.find(el => el.turn === turn);
    }

    const _setBlind = (smallBlindValue, bigBlindValue) => {
        setPlayersStatus((player) => player.map((el) => el.id ===
        _getPlayerFromTurnOrder(playersStatus.length - 2).id
            ? {...el, bet: smallBlindValue, totalBet: el.totalBet - smallBlindValue }
            : el) )
        setPlayersStatus((player) => player.map((el) => el.id ===
        _getPlayerFromTurnOrder(playersStatus.length - 1).id
            ? {...el, bet: bigBlindValue, totalBet: el.totalBet - bigBlindValue}
            : el) )
    }

    const _getPlayerStatus = (player) => {
        return playersStatus.find(el => el.id === player);
    }

    const _setTotalBet = (id, bet) => {
        setPlayersStatus((player) => player.map((el) => el.id === id ? {...el, totalBet: bet} : el) )
    }



    return (
        <div className="poker">
            {startGame && <GameInfo gameInfo={gameInfo}/>}
            {startGame && opponentIds.map((player, i) =>
                <OpponentDisplay key={i} playersStatus={playersStatus} currentTurn={currentTurn}
                                 playerId={player} game={'Poker'}
                                 nbOpponent={opponentIds.length} nb={i + 1}/>)}
            {startGame && <PlayerPoker clientID={props.clientID} playersStatus={playersStatus} currentTurn={currentTurn}/>}
            {startGame && <Board board={board}/>}
            {statePoker === 'end' && <EndPoker pseudoWin={pseudoWin} nbOpponent={opponentIds.length}/>}
            {startGame && <PlayerPokerOptions currentTurn={turn} setTurn={setTurn} socket={socket} tableName={tableName}
                                            clientID={props.clientID} playersStatus={playersStatus}
                                            statePoker={statePoker} gameInfo={gameInfo} setGameInfo={setGameInfo}
                                            setPlayersStatus={setPlayersStatus}/>}
            {startGame && <ChatPop socket={socket} tableName={tableName} pseudo={props.pseudo}
                                            chatOpen={chatOpen} setChatOpen={setChatOpen} clientID={props.clientID}
                                            messageList={props.messageList} setMessageList={props.setMessageList}
                                            newMessage={newMessage} setNewMessage={setNewMessage} />}

        </div>
    );
};

export default PokerTable;