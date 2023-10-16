function ImageIcon(props){
    return(
        <a className="mx-2" href={props.linkProfile}>
            <img src={props.image} className="img-fluid" alt={props.description} width={props.w} height={props.h}/>
            <h6 className="text-color mt-1"> {props.description} </h6>
        </a>
    )
}

export default ImageIcon;