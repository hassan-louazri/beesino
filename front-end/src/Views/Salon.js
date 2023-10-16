import React, {useState, useEffect} from 'react';
import "../Styles/Common.css"
import "../Styles/Home.css";
import io from 'socket.io-client';
import {Table} from "../Components/CasinoComponents";
import WaitingRoom from "./WaitingRoom";
import SalonHome from "../Components/SalonHome";

const socket = io(`ws://localhost:3001`);

function Salon(props) {
    const [clientId, setClientId] = useState("");
    const [tables, setTables] = useState([]);
    const [textMsg, setTextMsg] = useState("Select or create your table");
    const [waiting, setWaiting] = useState(false);
    const [ready, setReady] = useState(0);
    const [tableName, setTableName] = useState("");
    const [minPlayer, setMinPlayer] = useState(0);

    useEffect(() => {
        getAvailableTables();
        getClientID();
    }, []);
    const getAvailableTables = () => {
        socket.emit("getTables", props.game);
    };

    const getClientID = () => {
        socket.emit("clientID");
    };

    useEffect(() => {

        socket.on('createTable', (arg) => {
            console.log(arg);
            if (arg.status === 200 && props.game === arg.tableInfo.tableName.split("_")[1]) {
                setTables((tables) => [...tables, arg.tableInfo]);
            } else if (arg.status === 400) {
                setTextMsg("The number of table created has reached its max; " +
                    "please join a table");
            }
        });

        socket.on('joinTable', (arg) => {
            if (arg.status === 200) {
                setTableName(arg.tableName);
                setMinPlayer(arg.minPlayer);
                setWaiting(true);
            } else {
                setTextMsg("The table is full, please join a different table");
            }
        });

        socket.on('getTables', (arg) => {
            console.log(arg.tablesInfo);
            setTables(arg.tablesInfo.reverse());
        });

        socket.on('playerReady', (arg) => {
            console.log(arg);
        });

        socket.on("clientID", (arg) => {
            console.log(arg);
            setClientId(arg.clientID);
        });

        socket.on("updatePlayerCount", (arg) => {
            setTables((tables) => tables.map((table) => table.tableName === arg.tableName ? {
                ...table,
                playerCount: arg.playerCount
            } : table));
        })

        return () => {
            socket.off("clientID");
            socket.off('createTable');
            socket.off('getTables');
            socket.off('joinTable');
            socket.off('playerReady');
        };
    }, []);


    return (
        <Table>
            <div className="container">
                {(waiting === false)
                    ? <SalonHome socket={socket} tables={tables} clientId={clientId} textMsg={textMsg}
                                 game={props.game}/>
                    : <WaitingRoom socket={socket} addr={props.addr} tableName={tableName}
                                   waiting={waiting} setWaiting={setWaiting}
                                   ready={ready} setReady={setReady} minPlayer={minPlayer}
                                   game={props.game} clientId={clientId}/>}
            </div>
        </Table>
    );
}

export default Salon;