import React, {useEffect} from "react";
import CardRoom from "./CardRoom";

function SalonHome(props) {

    const createTable = () => {
        props.socket.emit("createTable", props.game);
    };

    return (
        <div>
            <h1 className="display-3 game-title pb-3"> {props.game.toUpperCase()} </h1>
            <h3 className="py-2"> {props.textMsg} </h3>
            <div className="d-flex justify-content-center py-5">
                <div className="row mb-3">
                    {props.tables?.map((table, i) =>
                        <div className="col" key={i}>
                            <CardRoom name={table.tableName} socket={props.socket} game={props.game}
                                      playerCount={table.playerCount} maxPlayer={table.maxPLayer}/>
                        </div>)}
                </div>
            </div>
            <button className="col btn btn-light buttonShadow p-3" onClick={createTable}> Create Table</button>
        </div>
    );
}

export default SalonHome;