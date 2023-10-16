import './Styles/App.css';
import ChoiceGamePage from "./Views/ChoiceGamePage";
import {Route, Routes} from "react-router-dom";
import Blackeirb from "./Views/Blackeirb";
import Pokeirb from "./Views/Pokeirb";
import Rouleirb from "./Views/Rouleirb";
import Profile from "./Views/Profile";
import Wallet from "./Views/Wallet";
import {changeNetwork} from "./scripts/Metamask";
import WaitingRoom from "./Views/WaitingRoom";


function App() {
    // changeNetwork("goerli")
    return (
        <div className="App">
            <Routes>
                <Route path={"/"} element={<ChoiceGamePage/>}/>
                <Route path={"/blackeirb"} element={<Blackeirb/>}/>
                <Route path={"/pokeirb"} element={<Pokeirb/>}/>
                <Route path={"/rouleirb"} element={<Rouleirb/>}/>
                <Route path={"/profile"} element={<Profile/>}/>
                <Route path={"/profile/wallet"} element={<Wallet/>}/>
            </Routes>
        </div>
    );
}

export default App;
