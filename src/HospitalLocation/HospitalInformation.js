/* eslint-disable */

import React, {useState, useEffect} from 'react';
import './HospitalInformation.scss'
import test from '../data/test.json'
import axios from 'axios';

import {connect, useSelector, useDispatch} from 'react-redux';

function HospitalInformation(props){
    const [data, setData] = useState([]);
    const [initName, setInitName] = useState([]);
    const [initTel, setInitTel] = useState([]);
    let clickLocationX = '';
    let clickLocationY = '';

    // 리스트 상태.
    let [listState, setListState] = useState(0);

    let state = useSelector(state => state);
    let dispatch = useDispatch();
    useEffect(() => {
        console.log('!!', state[1].hospitalName);
    }, [])
    return(
        <div className="container">
            <ul>
                {
                    props.data.map(i => {
                        return(
                            // 리스트를 클릭하면 클릭한 병원의 좌표를 kakaoMap 한테 보내줘야됨.
                            <div className="list" onClick={locationSend}>
                                {/* <div>{props.searchText}</div> */}
                                <div>
                                    <p className = "name">{i.name}</p>
                                    <p className = "tel">{i.tel}</p>
                                </div>
                                {/* <hr/> */}
                            </div>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default HospitalInformation;