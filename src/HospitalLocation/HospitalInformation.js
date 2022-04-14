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

    let [name, setName] = useState([]);
    useEffect(() => {
        setTimeout(() => {
            // for(var i = 0; i < 10; i++){
                // console.log(testArray);
                // setName(testArray);
                console.log('스테이트2', state[1]);
            // }
            setName([...name, state[1].hospitalName]);
        }, 5000)
    }, [])
    return(
        <div className="container">
            <ul>
                <li>{name}</li>
                {
                    name.map(i => {
                        return(
                            <div className="list">
                                <div>
                                    <p className = "name">{i[0]}</p>
                                    <p className = "tel">34</p>
                                </div>
                            </div>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default HospitalInformation;