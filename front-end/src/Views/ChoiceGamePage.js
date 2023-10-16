import blackeirb from "../Ressources/Images/blackjack.png";
import rouleirb from "../Ressources/Images/roulette.png";
import pokeirb from "../Ressources/Images/cards.png";
import AppBar from "../Components/AppBar";
import SelectGame from "../Components/SelectGame";
import "../Styles/Common.css"
import "../Styles/Home.css";
import { Table } from "../Components/CasinoComponents";

function SelectItem(props){
    return(
        <div className="col">
            <SelectGame image={props.image} title={props.title} link={props.link}/>
        </div>
    );
}

function ChoiceGamePage(){
    const listeImage = [blackeirb,rouleirb,pokeirb];
    const listeTitle = ["Blackeirb","Rouleirb","Pokeirb"];
    const listeLinks = ["/blackeirb","/rouleirb","/pokeirb"];

    return(
        <div>
            <AppBar links={[]} menu={[]} type={[]} dropdownMenu={[]} dropdownLinks={[]} imageLeft={false}/>
            <Table>
                <div className="container ">
                    <h1 className="display-5 py-5 text-color">Welcome!</h1>
                    <div className="row mb-3 py-5 choiceGame">
                        {listeImage.map((image,i) =>
                            <SelectItem key={i} image={image} title={listeTitle[i]} link={listeLinks[i]}/>
                        )}
                    </div>
                </div>
            </Table>
        </div>
    );
}

export default ChoiceGamePage;