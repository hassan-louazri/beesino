import waiter from "../Ressources/Images/waiter.png";
import ProfileDesription from "../Components/ProfileDescription";
import "../Styles/Profile.css" 
import {useEffect, useState} from "react";
import "../scripts/Metamask.js"
import { getAddrFromMetamask, getL1BalanceFromMetamask, getL2BalanceFromMetamask } from "../scripts/Metamask.js";
import AppBar from "../Components/AppBar";
import Wallet from "./Wallet";

const Profile =  () => {

    const titleList = ["Money on L1 level:", "Money on L2 level:"];
    const [L1Balance, setL1Balance] = useState("0");
    const [L2Balance, setL2Balance] = useState("0");
    const valueList = [L1Balance, L2Balance];

    useEffect(() => {
        getAddrFromMetamask().then((addr) => {
            getL1BalanceFromMetamask(addr[0]).then( value => setL1Balance(value));
            getL2BalanceFromMetamask(addr[0]).then( value => setL2Balance(value));
        });
    })

    return(
        <div>
            <AppBar links={["/"]} menu={["Home"]} type={["item"]} imageRight={false}/>
            <ProfileDesription titleList={titleList} img={waiter} valueList={valueList}/>
            <Wallet />
        </div>
    );
}

export default Profile;