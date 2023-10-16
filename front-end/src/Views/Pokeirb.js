import AppBar from "../Components/AppBar";
import Salon from "./Salon";
import {getAddrFromMetamask} from "../scripts/Metamask";
import {useState} from "react";

function Pokeirb(){
    const [addr, setAddr] = useState("");
    getAddrFromMetamask().then((addr) => setAddr(addr[0]));

    return(
        <div>
            <AppBar links={["/",""]} menu={["Home","Games"]} type={["item","dropdown"]}
                    dropdownMenu={["Blackeirb","Rouleirb"]}
                    dropdownLinks={["/blackeirb","/rouleirb"]} imageLeft={false}/>
            <Salon addr={addr} game={"Poker"}/>
        </div>

    );
}

export default Pokeirb;