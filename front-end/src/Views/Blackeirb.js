import AppBar from "../Components/AppBar";
import BlackjackTable from "../Components/BlackjackTable";
import {useState} from "react";
import {getAddrFromMetamask} from "../scripts/Metamask";
import {Table} from '../Components/CasinoComponents';
import ImageIcon from "../Components/ImageIcon";
import iconSolo from '../Ressources/Images/player.png';
import iconMulti from '../Ressources/Images/multiplayer.png';
import Salon from '../Views/Salon';


function ButtonPlay(props) {
    return(
        <div className=" py-4">
            <button className="buttonPlay border py-2 px-3 btn btn-secondary" onClick={() => props.useState(props.mode)}> 
                <ImageIcon image={props.image} description={props.mode}
                                              w={45} h={45} linkProfile={"#"}/>
            </button>
        </div>
    )
}

function Blackeirb(){
    const [playing, setPlaying] = useState("");
    const [addr, setAddr] = useState("")
    getAddrFromMetamask().then((addr) => setAddr(addr[0]));
    return(
        <div>
            <AppBar links={["/",""]} menu={["Home","Games"]} type={["item","dropdown"]} dropdownMenu={["Rouleirb","Pokeirb"]}
                    dropdownLinks={["/rouleirb","/pokeirb"]} imageLeft={false}/>

            {playing === "Solo" ?
                <div>
                    <Table>
                        <BlackjackTable addr={addr}/>
                    </Table>
                </div>
                :
                playing === "Multi" ?
                    <Salon addr={addr} game={"Blackjack"}/>
                    :
                    <div className="start">
                        <Table>
                            <h1 className="display-2 game-title"> BLACKJACK </h1>
                            <h4 className="text-color py-5"> Select your game mode </h4>
                            <ButtonPlay mode={"Solo"} image={iconSolo} useState={setPlaying}/>
                            <ButtonPlay mode={"Multi"} image={iconMulti} useState={setPlaying}/>
                        </Table>
                    </div>
            }
        </div>
    );
}

export default Blackeirb;