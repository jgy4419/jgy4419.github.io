import React, {useState, useEffect} from 'react';
import './HospitalInformation.scss'
import test from '../data/test.json'
import axios from 'axios';

function HospitalInformation(props){
    const [data, setData] = useState([]);
    const [initName, setInitName] = useState([]);
    const [initTel, setInitTel] = useState([]);
    return(
        <div className="container">
            <ul>
                {
                    props.data.map(i => {
                        return(
                            <div className="list">
                                {/* <div>{props.searchText}</div> */}
                                <p className = "name">이름: {i.name}</p>
                                <p className = "tel">전화번호: {i.tel}</p>
                                <hr/>
                            </div>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default HospitalInformation;