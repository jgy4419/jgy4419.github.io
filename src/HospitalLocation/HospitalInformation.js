/* eslint-disable */
/* global kakao */


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
            // useState에 배열 넣는 방법.
            setHospital(state[1].hospital);
            // stop에 1초에 한 번씩 바뀐 address 값을 보내줌. stop의 초기 값은 ''
            stop = state[1].setAddress;
            // console.log(stop);
            // 만약 stop의 값이 ''랑 다르면 setInterval 멈추고, spinner false로 바꿔주기.
            if(stop !== ''){
                clearInterval(interval);
                setSpinner(false);
            }
        }, 1000);
    }, [])
    // 클릭한 병원
    function clickHospital(){
        let hospitalInformationBox = document.querySelectorAll('.hospitalInformationBox');
        let hospitalName = document.querySelectorAll('.name');
        let names = [];
        for(let i = 0; i < hospitalInformationBox.length; i++){
            names.push(hospitalName[i].innerHTML);
            hospitalInformationBox[i].addEventListener('click', function(){
                // 클릭 할 때마다 count 증가되는거..? 고치기.
                console.log(hospitalName[i] + '', i);
                // 클릭한 list의 배열 위치를 찾아서 넣어주기.
                // let hospitalCount = names.indexOf(`${hospitalName[i].innerHTML}`);
                // // if(hospitalCount === 0 || hospitalCount !== 0){
                //     dispatch({type: '병원정보', payload:{
                //         count: hospitalCount,
                //     }})
                // // }
                console.log('props는', props);
                props.propsCount(i);
                // props.propsCount(1);
            });
        }
        // console.log(names)
        // console.log('redux', state[1].hospitalCount);
    }
    return(
        <div className="container">
            <ul>
                {
                    hospital.map(i => {
                        return(
                            <div className="list">
                                <div className="hospitalInformationBox" onClick={clickHospital}>
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