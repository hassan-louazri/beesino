import Chat from "./Chat";
import {useEffect} from "react";

function ChatPop(props){
    const socket = props.socket;

    useEffect(() => {
        socket.on("newMessage", (arg) => {
            if (props.clientID !== arg.id) {
                props.setNewMessage(true);
            }
        });

        return () => {
            socket.off("newMessage");
        }
    },[]);

    const handleClick = () => {
        props.setChatOpen(!props.chatOpen);
        props.setNewMessage(false);
    }

    return(
        <div className="popChat">
                <span>
                    {props.newMessage &&
                        <span className="position-absolute top-10 start-100 translate-middle p-2 bg-danger rounded-circle"
                                style={{display: props.chatOpen ? "none" : "block"}}/>
                    }
                    <img onClick={handleClick} width={70} height={70}
                         src="https://cdn-icons-png.flaticon.com/512/8765/8765894.png" alt=""/>
                    <div className="chatBox" style={{display: props.chatOpen ? 'block' : 'none'}}>
                        <Chat socket={props.socket} tableName={props.tableName} pseudo={props.pseudo} clientID={props.clientID}
                              inGame={true} messageList={props.messageList} setMessageList={props.setMessageList}/>
                    </div>
                </span>
        </div>
    )
}

export default ChatPop;