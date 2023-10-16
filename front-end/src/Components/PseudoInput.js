/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from "react";

function PseudoInput(props) {
    const [textPseudo, setTextPseudo] = useState("Enter your name");
    const pseudo = props.pseudo;
    const setPseudo = props.setPseudo;
    const socket = props.socket;
    const handleChange = (event) => {
        const newName = event.target.value.replace(
            /[^a-zA-Z]/g,
            ""
        );
        setPseudo(newName);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        (pseudo !== "")
            ? socket.emit("pseudo", props.tableName, pseudo)
            : setTextPseudo("Enter a valid username");
    }

    const leaveRoom = () => {
        socket.emit("leaveTable", props.tableName);
        props.setWaiting(false);
    }

    useEffect(() => {
        socket.on("pseudo", arg =>{
            if (arg.errorName === true){
                setTextPseudo("Username already used, find a new one.")
            }else {
                props.setName(true);
                socket.emit("updatePlayersName", props.tableName);
            }
        })
        return () =>{
            socket.off("pseudo")
        }
    },[])

    return(
        <div>
            <h1 className="text-color display-5 py-4"> {props.tableName.split("_")[0]} </h1>

            <form className="pseudoContainer" onSubmit={handleSubmit}>
                <h3 className="text-color py-2"> {textPseudo} </h3>
                <input className="inputPseudo mb-4" placeholder={"Your name"}
                       style={{fontStyle: pseudo !== "" ? "normal" : "italic"}}
                       type="text" minLength={2} maxLength={10} value={pseudo}
                       onChange={handleChange}/>
                <br/>
                <div className="py-4">
                    <button type="button" className="btn btn-light btn-lg buttonShadow mx-2" onClick={handleSubmit}> Submit </button>
                    <button type="button" className="btn btn-light btn-lg buttonShadow mx-2" onClick={leaveRoom}> Leave Table </button>
                </div>
            </form>
        </div>
    )
}

export default PseudoInput;