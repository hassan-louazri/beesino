function GameInfo(props) {
    
    return (
        <div>
            <span className="badge rounded-pill bg-secondary p-3 m-2 border border-warning">
                Total amount: {props.gameInfo.totalAmount * (10 ** (-3))} ETH</span>
            <span className="badge rounded-pill bg-secondary p-3 m-2 border border-warning">
                Current amount: {props.gameInfo.currentAmount * (10 ** (-3))} ETH</span>
        </div>
    )
};

export default GameInfo;