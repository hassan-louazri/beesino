function ButtonsOptions(props) {
    const hit = props.hit;
    const setHit = props.setHit
    const stopHit = props.stopHit
    const stand = props.stand;
    const setStand = props.setStand;
    const setEnd = props.setEnd;
    const setEndPlay = props.setEndPlay;

    function changeHit() {
        setHit(!hit);
    }

    function changeStand() {
        setStand(true);
    }

    function abandon() {
        setEnd(5);
        setEndPlay(true);
    }

    return (
        <div className="buttonOptions">
            <button className="btn btn-light btn-lg buttonHit buttonShadow mx-3"
                    onClick={changeHit} disabled={stand || stopHit}> Hit
            </button>
            <button className="btn btn-light btn-lg buttonStand buttonShadow mx-3"
                    onClick={changeStand} disabled={stand}> Stand
            </button>
            <button className="btn btn-light btn-lg buttonAbandon buttonShadow mx-3" onClick={abandon}
                    disabled={props.playerHand.length > 2 || stand}> Abandon
            </button>
        </div>
    );
}

export default ButtonsOptions;