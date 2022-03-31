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

    let state = useSelector(state => state);
    let dispatch = useDispatch();
    function locationSend(e){
        // 리스트를 클릭하면 동작하는 함수. 
        console.log(e.target.innerText);
        // console.log(props.data.);
        axios.get('http://localhost:8800/hospital')
        .then(res => {
            for(let i = 0; i < res.data.length; i++){
                // 클릭 시 이름이나 전화번호가 데이터에 있는 값들 중 동일한 값이 있을 때
                if(e.target.innerText === res.data[i].name || e.target.innerText === res.data[i].tel){
                    // 그 병원의 좌표 값을 가져옴.
                    clickLocationX = res.data[i].xAxis;
                    clickLocationY = res.data[i].yAxis;
                    dispatch({type: '좌표변경', payload: {x: res.data[i].xAxis, y: res.data[i].yAxis}});
                }
            }
            
            console.log(state[0].clickLocationsX)
            console.log(state[0].clickLocationsY)
        })
    }
    return(
        <div className="container">
            <ul>
                {
                    props.data.map(i => {
                        return(
                            // 리스트를 클릭하면 클릭한 병원의 좌표를 kakaoMap 한테 보내줘야됨.
                            <div className="list" onClick={locationSend}>
                                {/* <div>{props.searchText}</div> */}
                                <p className = "name" >{i.name}</p>
                                <p className = "tel">{i.tel}</p>
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