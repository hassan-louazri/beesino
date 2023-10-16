import {Card} from "./CasinoComponents";

function Board(props) {
    return (
        <div className="board">
            {props.board.map((card, i) =>
                <Card key={i} face={card.face} suit={card.suit}/>
            )}
        </div>
    )
}

export default Board;