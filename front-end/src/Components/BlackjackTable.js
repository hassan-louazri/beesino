/* eslint-disable react-hooks/exhaustive-deps */
import Dealer from './Dealer';
import ChipBlackjack from "../Components/ChipBlackjack"
import {useEffect, useState} from "react";
import Player from "./Player";
import {dealCard, sumValueCards} from "./CardGame";
import Endgame from "./Endgame";
import ButtonsOptions from "./ButtonsOptions";
import OpponentDisplay from "./OpponentDisplay";
import ChatPop from "./ChatPop";

function BlackjackTable(props) {

    const [amount, setAmount] = useState(0);
    const [bet, setBet] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playStart, setPlayStart] = useState(false);
    const [hit, setHit] = useState(false);
    const [stopHit, setStopHit] = useState(false);
    const [stand, setStand] = useState(false);
    const [endPlay, setEndPlay] = useState(false);
    const [end, setEnd] = useState(0); // 0: en cours, 1: fini, 2: win, 3: lose, 4:egalité, 5:abandon
    const [initCard, setInitCard] = useState(false);
    const [initGame, setInitGame] = useState(false);
    const [initGamePlayer, setInitGamePlayer] = useState(false);
    const [initGameDealer, setInitGameDealer] = useState(false);
    const [transaction, setTransaction] = useState(false);
    const [opponentHand, setOpponentHand] = useState([]);
    const [opponentIds, setOpponentIds] = useState([]);
    const [allStand, setAllStand] = useState(false); // en multi, tous les joueurs ont stand
    const [chatOpen, setChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState(false);
    let [card, setCard] = useState([]);

    const socket = props.socket;
    const tableName = props.tableName;
    const multi = props.multi || false;
    const id = props.clientID;

    const dealDealerMulti = () => socket.emit("standUpdate",tableName);
    const dealPlayerMulti = () => socket.emit("dealPlayerCardB",tableName);

    const dealDealerSolo = () => {
        (dealerHand[1].face === '')
            ? setDealerHand(old => [old[0], dealCard(card, setCard)])
            : setDealerHand(old => [...old, dealCard(card, setCard)])
    };

    const dealDealer = () => {
        (multi === false)
            ? dealDealerSolo()
            : dealDealerMulti();
    };

    const dealerAI = () => {
        (sumValueCards(dealerHand) < 17)
            ? dealDealer()
            : (sumValueCards(dealerHand) > 21)
                ? endGame(2)
                : endGame(1)
    };

    const endGame = (number) => {
        setEnd(number);
        setEndPlay(true);
    };

    const dealInitMultiCard = () => {
            socket.emit("cardInitPlayerB",tableName);
            socket.emit("cardInitDealerB",tableName);
    }

    const dealInitSoloCard = () => {
        if ((initCard === true && initGame === true) || card.length < 10) {
            const suit = ['C', 'D', 'H', 'S'];
            const face = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
            const tmp = [];
            suit.map((s) => face.map((f) => tmp.push({suit: s, face: f})));
            card = tmp;
            setCard(card);
            setInitGame(false);
        }
        setPlayerHand([dealCard(card, setCard), dealCard(card, setCard)]);
        setDealerHand([dealCard(card, setCard), {suit: '', face: ''}]);
    };

    const dealInitCard = () => {
        (multi === true)
            ? dealInitMultiCard()
            : dealInitSoloCard();
    };

    const hitMultiAction = () => {
        dealPlayerMulti();
    };
    const hitSoloAction = () => {
        setPlayerHand(old => [...old, dealCard(card, setCard)]);
    };

    const hitAction = () => {
        if(playerHand.length >= 2){
            (multi === true)
                ? hitMultiAction()
                : hitSoloAction();
        }
    };

    const getPlayerStatus = (playerID) => {
        const playerHand = opponentHand.find(elt => elt.id === playerID).hand;
        const playerBet = bet.find(elt => elt.id === playerID)?.bet;
        const pseudo = opponentHand.find(elt => elt.id === playerID)?.pseudo;
        return {id: playerID, hand: playerHand, bet: playerBet, pseudo: pseudo};
    }

    useEffect(() => {
        if (initGamePlayer === true && initGameDealer && multi === true) {
            setInitGame(false);
            setPlayStart(true);
        }
    }, [initGamePlayer, initGameDealer]);


    useEffect(() => {
        if (multi === true) {
            setOpponentIds(props.players.filter(player => player !== id));
            socket.emit("sendBet", {tableName: tableName, id: props.clientID, bet: props.amount});
        }
    },[]);


    useEffect(() => {

        socket?.on("cardPlayerB", (arg) => {
            const playerHand = [...arg];
            const hand = arg.find(elt => elt.id === id);
            setPlayerHand(hand.hand);
            const index = arg.indexOf(hand);
            playerHand.splice(index,1);
            setOpponentHand(playerHand);
            setInitGamePlayer(true);
        });

        socket?.on("cardDealerB", (arg) => {
            setDealerHand(arg);
            setInitGameDealer(true);
        });

        socket?.on("bet", (arg) => {
            if (arg.id !== props.clientID){
                setBet((bet) => [...bet, arg]);}
        });

        socket?.on("standNb", arg => {
            if(arg === true) {
                socket.emit("dealDealerCardB",tableName);
                setAllStand(true);
            }
        });

        return () => {
            socket?.off("cardPlayerB");
            socket?.off("cardDealerB");
            socket?.off("bet");
            socket?.off("standNb");
        };

    }, []);


    useEffect(() => {
        dealInitCard();
    }, [initCard, card]);


    useEffect(() => {
        hitAction();
    }, [hit]);

    useEffect(() => {
        if (stand !== true) return
        dealerAI();
    }, [stand, dealerHand]);

    useEffect(() => {
        setAmount(value => value);
    }, [amount]);

    const newGameStart = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setStand(false);
        setEnd(0);
        setEndPlay(false);
        setPlayStart(false);
        setStopHit(false);
        setAmount(0);
        setInitCard(false);
        setTransaction(false);
        if (multi) {
            socket.emit("leaveTable", tableName);
            socket.emit("endGameB", tableName);
            props.setWaiting(false);
        }
    };

    return (
        <div className="blackjackMulti">
            {playStart && <Dealer hand={dealerHand} style={(multi === true) ? {right: '840px'} : {}}/>}

            {playStart && <Player cards={playerHand} amount={(multi === true) ?
                props.amount : amount} style={(multi === true)
                ? {top: '60vh', right: '750px'} : {top: '60vh', right: '56vw'}} hit={hit} setHit={setHit} stand={stand}
                                           setStand={setStand} stopHit={stopHit} setStopHit={setStopHit} end={end}
                                           setEnd={setEnd} setEndPlay={setEndPlay} socket={socket}
                                  tableName={tableName}/>}

            {playStart && !endPlay && <ButtonsOptions playerHand={playerHand} hit={hit} setHit={setHit}
                                                      stand={stand} setStand={setStand} stopHit={stopHit}
                                                      setStopHit={setStopHit} setEndPlay={setEndPlay} setEnd={setEnd}/>}

            {playStart && multi && opponentIds.map((player, i) =>
                <OpponentDisplay key={i} playerStatus={getPlayerStatus(player)} nbOpponent={opponentIds.length}
                                 game={'Blackjack'} nb={i + 1} />)}


            {!playStart && !multi && <ChipBlackjack chipNumber={3} chipValue={[5, 20, 50]} addr={props.addr}
                                          play={playStart} setPlay={setPlayStart}
                                          amount={amount} setAmount={setAmount} setInitCard={setInitCard}
                                          setInitGame={setInitGame}/>}

            {endPlay && <Endgame playerHand={playerHand} dealerHand={dealerHand} addr={props.addr}
                                 end={end} setEnd={setEnd} newGame={newGameStart} amount={amount}
                                 transaction={transaction} setTransaction={setTransaction}
                                 multi={multi} nbOpponent={opponentIds.length} allStand={allStand}/>}

            {playStart && multi && <ChatPop socket={socket} tableName={tableName} pseudo={props.pseudo}
                                            chatOpen={chatOpen} setChatOpen={setChatOpen} clientID={props.clientID}
                                            messageList={props.messageList} setMessageList={props.setMessageList}
                                            newMessage={newMessage} setNewMessage={setNewMessage} />}

        </div>
    );
}

export default BlackjackTable;