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
    let [hospital, setHospital] = useState([]);
    useEffect(() => {
        // 여기 수정.. setTimeout 안써야됨,,
        setTimeout(() => {
            console.log('스테이트2', state[1]);
            // useState에 배열 넣는 방법.
            setHospital(state[1].hospital);
        }, 5000)
    }, [])
    function Information(){
        let array = [];
        for(let i = 0; i < name.length; i++){
            array.push(
                <div className="list">
                    <div>
                        <p className = "name">{name[i]}</p>
                        <p className = "tel">{phone[i]}</p>
                        <p className = "url">{url[i]}</p>
                        <p className = "address">{address[i]}</p>
                    </div>
                </div>
            );
        }
        return array;
    }
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
                                    <p className = "url">{i.place_url}</p>
                                </div>
                            </div>
                        )
                    })
                }
                {/* {Information()} */}
            </ul>
        </div>
    )
}

export default HospitalInformation;