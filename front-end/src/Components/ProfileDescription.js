import React from 'react'
import "../Styles/Profile.css"
import {Table} from "./CasinoComponents";

function ProfileItems(props){

    const title = props.title;
    const value = parseInt(props.value)*10**-18;

    return (
        <div>
            <div className="colProfile">
                <p className='title'>{title}</p>
                <p className='value'>{value.toPrecision(3)} ETH</p>
            </div>
        </div>
    )
}



function ProfileDesription(props){

    const titleList = props.titleList;
    const valueList = props.valueList;

    return(
    <Table>
        <h3 className='yourProfile'>Your Profile : </h3>

        <div className="container">
            
            <div className="item-container">
                {titleList.map((titleList,i)=>{
                    return <ProfileItems key={i} title={titleList} value={valueList[i]}/>
                })}
            </div>
        </div>
    </Table>
    );
}

export default ProfileDesription