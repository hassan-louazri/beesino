import ImageIcon from "./ImageIcon";
import logo from "../Ressources/Images/waiter.png";
import profileImage from "../Ressources/Images/coin.png";
import MenuList from "./MenuList";

function AppBar(props){
    const menu = props.menu;
    const links = props.links;
    const imageRight = (props.imageRight != null) ? props.imageRight : true;
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-dark">
            <a className="navbar navbar-brand" href="/">
                <h1 className=" display-2"> CASINO </h1>
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsingMenuList">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="nav navbar-collapse collapse " id="collapsingMenuList">
                <div className="navbar-nav ms-auto " id="navbarSupportedContent">

                    {(menu.length !== 0) && <MenuList links={links} value={menu} type = {props.type}
                                                    dropdownMenu={props.dropdownMenu}
                                                    dropdownLinks={props.dropdownLinks}/>}

                    {imageRight && <ImageIcon image={logo} description={"Your Profile"}
                                              w={45} h={54} linkProfile={"/profile"}/>}
                </div>
            </div>
        </nav>
    );
}

export default AppBar;