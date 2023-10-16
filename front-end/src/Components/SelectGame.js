import '../Styles/Home.css';

function SelectGame(props) {
    return(
        <a href={props.link}>
            <div className="card mx-auto bg-secondary gameSelect">
                <img src={props.image} className="card-img-top" alt="..." width={200} height={200}/>
                <div className="card-body">
                    <h2 className="card-title ">{props.title}</h2>
                </div>
            </div>
        </a>
    )
}

export default SelectGame;

