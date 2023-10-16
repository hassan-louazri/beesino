/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import ScroolToBottom from "react-scroll-to-bottom";
import '../Styles/Chat.css'


function Chat(props) {

    const [currentMessage, setCurrentMessage] = useState("");
    const socket = props.socket;

    const sendMessage = () => {
        if(currentMessage !== ""){
            const messageData = {
                id: props.clientID,
                tableName: props.tableName,
                username: props.pseudo,
                message: currentMessage,
                time: dateFormatter(new Date(Date.now()).getHours()) + ":"
                    + dateFormatter(new Date(Date.now()).getMinutes())
            }
            socket.emit("send_message", messageData);
            if (props.inGame === true) socket.emit("newMessage", messageData);
            setCurrentMessage("");
        } 
    };

    const dateFormatter = (date) => {
        return date < 10 ? "0"+date : date;
    }

    useEffect(() => {
        socket.on("receive_message", (data) => {
            props.setMessageList((list) => [...list, data]);
        });

        return() => {
            socket.off("receive_message");
        };
    }, [])

    return(
        <div className="sideBarContainer">
            <div className="chat-header p-1">
                <h2> Chat </h2>
            </div>
            <div className="chat-body">
                <ScroolToBottom className="message-container">
                    {props.messageList.map((messageContent, i) => {
                        return <div key={i} className="message" id={props.pseudo === messageContent.username ? "you" : "other"}>
                            <div>
                                <div className="message-content py-2">
                                    <span>{messageContent.message}</span>
                                </div>
                                <div className="message-meta py-1">
                                    <h6 id="time">{messageContent.time}</h6>
                                    <h6 id="author">{(messageContent.username === props.pseudo)
                                        ? "You"
                                        : messageContent.username}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    })}
                </ScroolToBottom>
                
            </div>
            <div className="chat-footer">
                <input 
                type='text' 
                value={currentMessage}
                placeholder="..." 
                onChange={(event)=>{
                    setCurrentMessage(event.target.value);
                }}
                onKeyDown={(event) =>{
                    event.key === "Enter" && sendMessage();
                }}
                ></input>
                <button onClick={sendMessage}>&#9658;</button>
            </div>   
        </div>
    )
}

export default Chat;