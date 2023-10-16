function MenuListItems(props) {
    if (props.type === "item") {
        return (
            <li className="nav-item" style={{marginRight: "20px"}}>
                <a className="nav-link m-2" style={{color: "white", fontSize: "20px"}}
                   href={props.link}>{props.value}</a>
            </li>
        );
    } else if (props.type === "dropdown") {
        const dropdownMenu = props.dropdownMenu;
        const dropdownLinks = props.dropdownLinks;
        return (
            <li className="nav-item dropdown" style={{ marginRight: "50px"}}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="nav-link dropdown-toggle" style={{color: "white", fontSize: "20px"}} href={"#"}
                   role="button" data-bs-toggle="dropdown" aria-expanded="false">{props.value} </a>
                <ul className="dropdown-menu" style={{color: "white"}}>
                    {dropdownMenu.map((menu, index) => <li key={index}><a className="dropdown-item"
                                                                          href={dropdownLinks[index]}>{menu}</a></li>)}
                </ul>
            </li>
        );
    }

}

function MenuList(props) {

    const items = props.value;
    const links = props.links;
    const type = props.type;

    return (
        <ul className="navbar-nav mr-auto align-items-center">
            {items.map((item, index) => <MenuListItems key={index} link={links[index]} value={item} type={type[index]}
                                                       dropdownMenu={props.dropdownMenu}
                                                       dropdownLinks={props.dropdownLinks}/>)}
        </ul>
    );
}

export default MenuList;