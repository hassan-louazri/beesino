import AppBar from "../Components/AppBar";
import RouletteComponent from "../Components/RouletteComponent"
import {Table} from '../Components/CasinoComponents'
import RouleirbPlateau from '../Components/RouleirbPlateau'
import ChipRoulette from "../Components/ChipRoulette";
import {useState, useEffect} from "react"
import {getAddrFromMetamask, sendL2toL2FromBank} from '../scripts/Metamask'

function Rouleirb(){
    const [bet, setBet] = useState([0, "nothing"]);
    const [allBet, setAllBet] = useState([]);
    const [betAmount, setBetAmount] = useState(0);
    const [chipColor, setChipColor] = useState("white");
    const [addr, setAddr] = useState("")
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [listAmount, setListAmount] = useState([]);
    const prizeX2 = ["1-12", "13-24", "25-36"];
    const prizeX1 = ["1-18","Even", "Red", "Black", "Odd", "19-36"];
    const [transaction, setTransaction] = useState(false);

    useEffect(() => {
        if(addr === ""){
            getAddrFromMetamask().then((addr) => setAddr(addr[0]));
        }
    }, [addr])

    const addBet = () => {
        setAllBet([...allBet, {amount: bet[0], number: bet[1], color: chipColor}]);
        setBet([0, "nothing"]);
        setBetAmount(betAmount + bet[0]);
    }

    const resetBet = () => {
        setAllBet([]);
        setBet([0, "nothing"]);
        setBetAmount(0);
    }

    useEffect(() => {
        setChipColor(color => color);
    }, [chipColor]);

    const checkIfArrayHasNumber = (limiter) => {
        const start = parseInt(limiter.split("-")[0]);
        const end = parseInt(limiter.split("-")[1]);
        const array = Array(end - start + 1).fill().map((_, idx) => start + idx)
        return array.includes(prizeNumber);
    }

    const getColor = (number) => {
        return number % 2 === 0 ? "Black" : "Red";
    }

    const checkParity = (bet) => {
        return ("Even" === bet && prizeNumber % 2 === 0 ) 
            || ("Odd" === bet && prizeNumber % 2 !== 0);
    }

    const checkColorNumber = (bet) => {
        return ("Red" === bet && getColor(prizeNumber) === "Red")
            || ("Black" === bet && getColor(prizeNumber) === "Black");
    }

    const checkCaseX1 = (bet) => {
        return (prizeX1.includes(bet)) && ((["1-18", "19-36"].includes(bet) ? checkIfArrayHasNumber(bet) : false) 
            || (checkColorNumber(bet, prizeNumber)) || (checkParity(bet)))
    }

    const winOrLose = () => {
        // x35 pour solo | x2 pour douzaine | x1 pour Even|Red|Black|Odd|1-18|19-36
        allBet.forEach((v, i) => {
            if (v.number === prizeNumber) {
                setListAmount([...listAmount, 35 * v.amount]);
            } else if (prizeX2.includes(v.number) && checkIfArrayHasNumber(v.number)){
                setListAmount([...listAmount, 2 * v.amount]);
            } else if (checkCaseX1(v.number)) {
                setListAmount([...listAmount, v.amount]);
            }
        })
        setTransaction(true)
    }

    useEffect(() => {
        const sum = listAmount.reduce((partial, a) => partial + a, 0);
        if (sum > 0 && transaction) {
            sendL2toL2FromBank(addr, sum).then(() => {setTransaction(false)})
        }
    }, [transaction])
    

    return(
        <div>
            <AppBar links={["/",""]} menu={["Home","Games"]} type={["item","dropdown"]} dropdownMenu={["Blackeirb","Pokeirb"]}
                dropdownLinks={["/blackeirb","/pokeirb"]} imageLeft={false}/>
            <Table>
                <div className="container">

                    <div className="row">
                        <RouletteComponent addr={addr} bet={bet} setBet={setBet} allBet={allBet} reset={resetBet}
                                           prizeNumber={prizeNumber} setPrizeNumber={setPrizeNumber} winOrLose={winOrLose}/>
                        <RouleirbPlateau bet={bet} setBet={setBet} allBet={allBet} />
                        <ChipRoulette chipValue={[5, 50, 100]} bet={bet} setBet={setBet} betAmount={betAmount}
                                      setChipColor={setChipColor} />
                    </div>
                    <div className="bet">
                        <div className="infoBet"> {`Temporary bet: ${bet[0]} on ${bet[1]}`}</div>
                        <button className="btn btn-light btn-lg buttonBet" onClick={addBet} disabled={bet[0]===0}>
                            Place Bet
                        </button>
                        <button className="btn btn-light btn-lg buttonResetBet" onClick={resetBet}> Reset Bet </button>
                    </div>
                </div>
            </Table>
        </div>
        
    );
}

export default Rouleirb;