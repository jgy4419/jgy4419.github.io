/* eslint-disable */

import React, {useState, useEffect} from 'react';
import './HospitalInformation.scss'
import axios from 'axios';
import Spinner from '../Spinner';

import {connect, useSelector, useDispatch} from 'react-redux';

function HospitalInformation(props){
    const [data, setData] = useState([]);
    const [initName, setInitName] = useState([]);
    const [initTel, setInitTel] = useState([]);
    let clickLocationX = '';
    let clickLocationY = '';

    // 리스트 상태.
    let [listState, setListState] = useState(0);

    let [spinner, setSpinner] = useState(true);

    let state = useSelector(state => state);
    let dispatch = useDispatch();
    let [hospital, setHospital] = useState([]);
    let stop = '';

    useEffect(() => {
        let interval = setInterval(() => {
            console.log('after', state[1].addressChange);
            // useState에 배열 넣는 방법.
            setHospital(state[1].hospital);
            stop = state[1].addressChange;
            if(stop !== ''){
                clearInterval(interval);
                setSpinner(false);
            }
        }, 1000);
    }, [])
    return(
        <div className="container">
            <ul>
                {
                    hospital.map(i => {
                        return(
                            <div className="list">
                                <div>
                                    <p className = "name">{i.place_name}</p>
                                    <p className = "tel">{i.phone}</p>
                                    <p className = "address">{i.road_address_name}</p>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    spinner === true
                    ? (<Spinner className="spinner"/>)
                    : null
                }
            </ul>
        </div>
    )
}

export default HospitalInformation;